import { logger, task } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { snapshotsInWatchScraping } from "@workspace/db/drizzle/schema";

import { extractDetail as extractDetailScript } from "../script/scrape_and_crawl";
import { Snapshot } from "../types";
import {
  DAY_TASK_PRODUCT_DETAIL_EXTRACTION,
  NIGHT_TASK_PRODUCT_DETAIL_EXTRACTION
} from "../constant";

const taskConfig = {
  maxDuration: 60, // Stop executing after 60 secs (1 min) of compute
  retry: {
    maxAttempts: 3,
  },
  run: extractDetail,
};

export const dayProductDetailExtractionTask = task({
  id: DAY_TASK_PRODUCT_DETAIL_EXTRACTION,
  queue: {
    name: 'firecrawl-detail-day-queue',
    concurrencyLimit: 1,
  },
  ...taskConfig,
});

export const nightProductDetailExtractionTask = task({
  id: NIGHT_TASK_PRODUCT_DETAIL_EXTRACTION,
  queue: {
    name: 'firecrawl-detail-night-queue',
    concurrencyLimit: 2,
  },
  ...taskConfig,
});

async function extractDetail(snapshot: Snapshot) {
  try {
    const extractedResult = await extractDetailScript(snapshot.url);

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
}
