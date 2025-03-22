export const MAX_RUNS_PER_WINDOW = Number(process.env.MAX_RUNS_PER_WINDOW) || 3;
export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 6 * 1000; // 6 seconds
export const TASK_PRODUCT_LISTING_EXTRACTION = "product-listing-extraction";
export const TASK_PRODUCT_DETAIL_EXTRACTION = "product-detail-extraction";
