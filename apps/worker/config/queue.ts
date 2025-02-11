import Redis from "ioredis";

export const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

export const LISTING_QUEUE = "listing";
export const DETAIL_QUEUE = "detail";
export const SCRAPE_LISTING_TOPIC = "scrape-listing";
export const SCRAPE_DETAIL_TOPIC = "scrape-detail";

export const globalRateLimiter = {
  groupKey: 'scraper', // Shared identifier across queues
  max: 10,                    // 10 requests
  duration: 60000,            // per minute (60,000ms)
};

export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 60000, // Wait 1 minute before retrying
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours
    count: 1000, // Keep last 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    count: 1000, // Keep last 1000 failed jobs
  },
} as const;

