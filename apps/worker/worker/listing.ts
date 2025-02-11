import { Worker, Queue } from "bullmq";
import { eq } from "drizzle-orm";

import { db } from "@workspace/db";
import {
  connection,
  LISTING_QUEUE,
  SCRAPE_LISTING_TOPIC,
  SCRAPE_DETAIL_TOPIC,
  globalRateLimiter,
} from "../config/queue";
import { snapshotsInWatchScraping } from "@workspace/db/drizzle/schema";
import { extractListing } from "../scripts/scrape_and_crawl";
import { detailsQueue } from "./detail";

export const listingQueue = new Queue(LISTING_QUEUE, { connection });

const worker = new Worker(
  LISTING_QUEUE,
  async (job) => {
    try {
      const { snapshotId } = job.data;
      const [snapshot] = await db
        .select()
        .from(snapshotsInWatchScraping)
        .where(eq(snapshotsInWatchScraping.id, snapshotId))
        .limit(1);
      if (!snapshot) {
        throw new Error(`Snapshot not found or already processed by another worker for id: ${snapshotId}`);
      }
      await job.updateProgress(10);

      const extractedResult = await extractListing(snapshot.url);
      await job.updateProgress(50);

      const detailSnapshots = await crawlDetail(job, snapshot, extractedResult)
      await job.updateProgress(90);

      await detailsQueue.addBulk(
        detailSnapshots.map((snapshot) => ({
          name: SCRAPE_DETAIL_TOPIC,
          data: { snapshotId: snapshot.id.toString() },
        })),
      );
      await job.updateProgress(100);
    } catch (error) {
      console.error(`[Worker] Job ${job.id} failed:`, error);

      const regex = /Status code: 429/;
      if (error.message && regex.test(error.message)) {
        throw Worker.RateLimitError();
      }

      throw error; // This will mark the job as failed in BullMQ
    }
  },
  {
    connection,
    concurrency: 3,
    limiter: globalRateLimiter,
  }
);

async function crawlDetail(job, snapshot, extractedResult) {
  const detailSnapshots = await db.transaction(async (tx) => {
    await tx
      .update(snapshotsInWatchScraping)
      .set({ extractedData: extractedResult })
      .where(eq(snapshotsInWatchScraping.id, snapshot.id));
    await job.updateProgress(60);

    const nextPageLink = extractedResult.pagination.nextPage;
    if (nextPageLink) {
      const [createdSnapshot] = await tx
        .insert(snapshotsInWatchScraping)
        .values({
          sourceId: snapshot.sourceId,
          url: nextPageLink,
        })
        .returning();

      await listingQueue.add(
        SCRAPE_LISTING_TOPIC,
        { snapshotId: createdSnapshot.id.toString() },
      )
      await job.updateProgress(70);
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
    await job.updateProgress(80);

    return createdSnapshots;
  });

  return detailSnapshots;
}

console.info("[LISTING WORKER] Ready to process jobs");

worker.on('progress', job => {
  console.log(`Job ${job.id} progress: ${job.progress}%`);
});

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job.id}, Error: ${err}`);
});

