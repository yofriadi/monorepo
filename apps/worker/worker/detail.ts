import { Queue, Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { db } from "@workspace/db";
import {
  connection,
  DETAIL_QUEUE,
  globalRateLimiter,
} from "../config/queue";
import { snapshotsInWatchScraping } from "@workspace/db/drizzle/schema";
import { extractDetail } from "../scripts/scrape_and_crawl";

export const detailsQueue = new Queue(DETAIL_QUEUE, { connection });

const worker = new Worker(
  DETAIL_QUEUE,
  async (job) => {
    console.log(`[DETAIL WORKER] start working on with job id ${job.id} and snapshot id ${job.data.snapshotId}`)
    try {
      const { snapshotId } = job.data;
      const [snapshot] = await db
        .select()
        .from(snapshotsInWatchScraping)
        .where(eq(snapshotsInWatchScraping.id, snapshotId))
        .limit(1);
      if (!snapshot) {
        throw new Error(`Snapshot not found for id: ${snapshotId}`);
      }
      await job.updateProgress(10);

      const extractedResult = await extractDetail(snapshot.url);
      await job.updateProgress(50);

      await db
        .update(snapshotsInWatchScraping)
        .set({ extractedData: extractedResult })
        .where(eq(snapshotsInWatchScraping.id, snapshot.id));
      await job.updateProgress(100);
    } catch (error) {
      console.error(`[DETAIL WORKER] Job ${job.id} failed:`, error);
      throw error; // This will mark the job as failed in BullMQ
    }
  },
  {
    connection,
    concurrency: 3,
    limiter: globalRateLimiter,
  }
);

console.info("[WORKER DETAIL] Ready to process jobs");

worker.on('progress', job => {
  console.log(`Job ${job.id} progress: ${job.progress}%`);
});

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job.id}, Error: ${err}`);
});

