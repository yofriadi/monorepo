import { queue } from "@trigger.dev/sdk/v3";

const FIRECRAWL_QUEUE = "firecrawl-queue";
export const firecrawlQueue = queue({
  name: FIRECRAWL_QUEUE,
  concurrencyLimit: process.env.QUEUE_CONCURRENCY_LIMIT ? parseInt(process.env.QUEUE_CONCURRENCY_LIMIT) : 3,
});
