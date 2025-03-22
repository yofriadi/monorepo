import { logger, task, tasks } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { snapshotsInWatchScraping } from "@workspace/db/drizzle/schema";

import { extractListing } from "../script/scrape_and_crawl";
import { firecrawlQueue } from "./queue";
import { Snapshot, ExtractedListingData } from "../types";
import {
  MAX_RUNS_PER_WINDOW,
  RATE_LIMIT_WINDOW_MS,
  TASK_PRODUCT_LISTING_EXTRACTION,
} from "../constant";

export const productListingExtractionTask = task({
  id: TASK_PRODUCT_LISTING_EXTRACTION,
  queue: firecrawlQueue,
  retry: {
    maxAttempts: 3,
  },
  run: async (snapshot: Snapshot) => {
    try {
      const extractedResult = await extractListing(snapshot.url);
      const { detailSnapshots, nextPageSnapshot } = await crawlDetail(snapshot, extractedResult);

      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_WINDOW_MS));

      // Process detail snapshots with rate limiting
      const batchSize = MAX_RUNS_PER_WINDOW; // Ensure batch size doesn't exceed rate limit
      for (let i = 0; i < detailSnapshots.length; i += batchSize) {
        const batch = detailSnapshots.slice(i, i + batchSize);

        // NOTE: the first batch scraping task is special case
        let delay: { delay?: string } = {};
        if (i === 0) {
          delay.delay = `1m`;
        } else {
          delay = {};
        }

        await tasks.batchTriggerAndWait(
          "product-detail-extraction",
          batch.map(snapshot => ({ payload: snapshot, ...delay })),
        );

        // Wait for rate limit window to reset before processing next batch
        if (i + batchSize < detailSnapshots.length) {
          logger.info(`[LISTING TASK] Rate limiting - waiting before next batch`, { 
            snapshotId: snapshot.id,
            processedCount: i + batch.length,
            totalCount: detailSnapshots.length
          });
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_WINDOW_MS));
        }
      }

      // Add trigger for next page if it exists
      if (nextPageSnapshot) {
        // NOTE: There is no delay here, might want to look for the behavior
        await tasks.trigger(TASK_PRODUCT_LISTING_EXTRACTION, nextPageSnapshot);
      }

      return {
        success: true,
        snapshotId: snapshot.id,
        processedDetailPages: detailSnapshots.length,
        hasNextPage: !!nextPageSnapshot
      };
    } catch (error) {
      logger.error(`[LISTING TASK] Task failed for snapshot ${snapshot.id}`, { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.message : String(error),
        snapshotId: snapshot.id,
      });

      const regex = /Status code: 429/;
      if (error instanceof Error && error.message && regex.test(error.message)) {
        logger.warn(`[LISTING TASK] Rate limit hit for snapshot ${snapshot.id}`, { snapshotId: snapshot.id });
        // In Trigger.dev, we don't have a specialized rate limit error, 
        // but we can throw a regular error that our retry mechanism will handle
      }

      throw error;
    }
  },
});

async function crawlDetail(
  snapshot: Snapshot,
  extractedResult: ExtractedListingData
) {
  let nextPageSnapshot = null;

  const detailSnapshots = await db.transaction(async (tx) => {
    await tx
      .update(snapshotsInWatchScraping)
      .set({ extractedData: extractedResult })
      .where(eq(snapshotsInWatchScraping.id, snapshot.id));

    if (extractedResult.nextPageLink) {
      const [createdSnapshot] = await tx
        .insert(snapshotsInWatchScraping)
        .values({
          sourceId: snapshot.sourceId,
          parentId: snapshot.id,
          url: extractedResult.nextPageLink,
        }).returning();

      // Store the next page snapshot for trigger later
      nextPageSnapshot = createdSnapshot;
    }

    const hostname = new URL(snapshot.url).hostname;
    const productLinks = extractedResult.productLinks.map((productLink) => ({
      parentId: snapshot.id,
      url: hostname + productLink,
    }));

    const createdSnapshots = await tx
      .insert(snapshotsInWatchScraping)
      .values(productLinks)
      .returning();

    return createdSnapshots;
  });

  return { detailSnapshots, nextPageSnapshot };
}

