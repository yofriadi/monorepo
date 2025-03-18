export const MAX_RUNS_PER_MINUTE = Number(process.env.MAX_RUNS_PER_MINUTE) || 10;
export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000; // 1 minute
export const TASK_PRODUCT_LISTING_EXTRACTION = "product-listing-extraction";
export const TASK_PRODUCT_DETAIL_EXTRACTION = "product-detail-extraction";
