import { logger, task } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { snapshotsInWatchScraping } from "@workspace/db/drizzle/schema";

import { extractDetail } from "../script/scrape_and_crawl";
import { firecrawlQueue } from "./queue";
import { Snapshot } from "../types";
import { TASK_PRODUCT_DETAIL_EXTRACTION } from "../constant";

export const productDetailExtractionTask = task({
  id: TASK_PRODUCT_DETAIL_EXTRACTION,
  maxDuration: 60, // Stop executing after 60 secs (1 min) of compute
  queue: firecrawlQueue,
  retry: {
    maxAttempts: 3,
  },
  run: async (snapshot: Snapshot) => {
    try {
      const extractedResult = await extractDetail(snapshot.url);

      await db
        .update(snapshotsInWatchScraping)
        .set({ extractedData: extractedResult })
        .where(eq(snapshotsInWatchScraping.id, snapshot.id));

      return {
        success: true,
        snapshotId: snapshot.id,
        extractedData: extractedResult
      };
    } catch (error) {
      logger.error(`[DETAIL TASK] Task failed for snapshot ${snapshot.id}`, { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.message : String(error),
        snapshotId: snapshot.id,
      });

      throw error;
    }
  },
});
