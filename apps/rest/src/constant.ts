export const MAX_RUNS_PER_WINDOW = Number(process.env.MAX_RUNS_PER_WINDOW) || 3;
export const NIGHT_CRON_SCHEDULE_TIME = "0 21 * * *";

export const DAY_TASK_PRODUCT_LISTING_EXTRACTION = "day-product-listing-extraction";
export const DAY_TASK_PRODUCT_DETAIL_EXTRACTION = "day-product-detail-extraction";
export const NIGHT_TASK_PRODUCT_DETAIL_EXTRACTION = "night-product-detail-extraction";
export const NIGHT_TASK_PRODUCT_LISTING_EXTRACTION = "night-product-listing-extraction";
export const SCHEDULED_TASK_PRODUCT_LISTING_EXTRACTION = "scheduled-product-listing-extraction";
