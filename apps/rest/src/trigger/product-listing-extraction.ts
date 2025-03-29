import { logger, task, tasks, schedules } from "@trigger.dev/sdk/v3";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { db } from "@workspace/db";
import { snapshotsInWatchScraping } from "@workspace/db/drizzle/schema";

import { extractListing as extractListingScript } from "../script/scrape_and_crawl";
import { Snapshot } from "../types";
import {
  MAX_RUNS_PER_WINDOW,
  NIGHT_CRON_SCHEDULE_TIME,
  DAY_TASK_PRODUCT_DETAIL_EXTRACTION,
  DAY_TASK_PRODUCT_LISTING_EXTRACTION,
  NIGHT_TASK_PRODUCT_DETAIL_EXTRACTION,
  NIGHT_TASK_PRODUCT_LISTING_EXTRACTION,
  SCHEDULED_TASK_PRODUCT_LISTING_EXTRACTION,
} from "../constant";

const taskConfig = {
  maxDuration: 600, // Stop executing after 10 minutes of compute
  retry: {
    maxAttempts: 3,
  },
};

export const dayProductListingExtractionTask = task({
  id: DAY_TASK_PRODUCT_LISTING_EXTRACTION,
  queue: {
    name: 'firecrawl-listing-day-queue',
    concurrencyLimit: 1,
  },
  run: async (snapshot: Snapshot) => {
    try {
      const { detailSnapshots, nextPageSnapshot } = await processExtraction(snapshot);

      for (const detailSnapshot of detailSnapshots) {
        await tasks.triggerAndWait(DAY_TASK_PRODUCT_DETAIL_EXTRACTION, detailSnapshot);
      }

      if (nextPageSnapshot) {
        await tasks.triggerAndWait(DAY_TASK_PRODUCT_LISTING_EXTRACTION, nextPageSnapshot);
      }

      return {
        success: true,
        snapshotId: snapshot.id,
        processedDetailPages: detailSnapshots.length,
        hasNextPage: !!nextPageSnapshot
      };
    } catch (error) {
      handleError(error, snapshot);
    }
  },
  ...taskConfig,
});

export const scheduledProductListingExtractionTask = schedules.task({
  id: SCHEDULED_TASK_PRODUCT_LISTING_EXTRACTION,
  queue: {
    name: 'scheduled-firecrawl-listing-queue',
    concurrencyLimit: 1,
  },
  cron: {
    pattern: NIGHT_CRON_SCHEDULE_TIME,
    timezone: "Asia/Jakarta",
  },
  run: async (): Promise<{
    success: boolean;
    processedSnapshots: Snapshot[];
  }> => {
    const snapshots = await db
      .select()
      .from(snapshotsInWatchScraping)
      .where(
        and(
          isNotNull(snapshotsInWatchScraping.sourceId),
          isNull(snapshotsInWatchScraping.parentId)
        )
      );

    const processedSnapshots = [];
    for (const snapshot of snapshots) {
      try {
        logger.info(`[SCHEDULED LISTING TASK] Processing snapshot for url ${snapshot.url}`);
        await processListing(snapshot);
        processedSnapshots.push(snapshot);
      } catch (error) {
        logger.error(`[SCHEDULED TASK] Error processing snapshot ${snapshot.id}`, { error });
      }
    }

    return {
      success: true,
      processedSnapshots,
    };
  },
  ...taskConfig,
});

export const nightProductListingExtractionTask = task({
  id: NIGHT_TASK_PRODUCT_LISTING_EXTRACTION,
  queue: {
    name: 'firecrawl-listing-night-queue',
    concurrencyLimit: 1,
  },
  run: async (snapshot: Snapshot) => {
    await processListing(snapshot);
  },
  ...taskConfig,
});

async function processListing(snapshot: Snapshot) {
  try {
    const { detailSnapshots, nextPageSnapshot } = await processExtraction(snapshot);

    const batchSize = MAX_RUNS_PER_WINDOW;
    for (let i = 0; i < 6; i += batchSize) {
      const batch = detailSnapshots.slice(i, i + batchSize);
      await tasks.batchTriggerAndWait(
        NIGHT_TASK_PRODUCT_DETAIL_EXTRACTION,
        batch.map((snapshot: Snapshot) => ({ payload: snapshot })),
      );
    }

    if (nextPageSnapshot) {
      await tasks.triggerAndWait(NIGHT_TASK_PRODUCT_LISTING_EXTRACTION, nextPageSnapshot);
    }

    return {
      success: true,
      snapshotId: snapshot.id,
      processedDetailPages: detailSnapshots.length,
      hasNextPage: !!nextPageSnapshot
    };
  } catch (error: unknown) {
    handleError(error, snapshot);
  }
}

async function processExtraction(snapshot: Snapshot) {
  let nextPageSnapshot = null;
  const extractedResult = await extractListingScript(snapshot.url);

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

function handleError(error: unknown, snapshot: Snapshot) {
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
