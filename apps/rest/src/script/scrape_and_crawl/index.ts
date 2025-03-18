import FirecrawlApp from "@mendable/firecrawl-js";
import { extractListing as extractListingChrono24 } from "./chrono24_product_listing";
import { extractDetail as extractDetailChrono24 } from "./chrono24_product_detail";
import { extractListing as extractListingCarousell } from "./carousell_product_listing";
import { extractDetail as extractDetailCarousell } from "./carousell_product_detail";

const crawler = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

const extractListing = async (url: string) => {
  if (url.includes("chrono24")) {
    return extractListingChrono24(crawler, url);
  } else if (url.includes("carousell")) {
    return extractListingCarousell(crawler, url);
  } else {
    throw new Error(`Unsupported URL: ${url}`);
  }
};

const extractDetail = async (url: string) => {
  if (url.includes("chrono24")) {
    return extractDetailChrono24(crawler, url);
  } else if (url.includes("carousell")) {
    return extractDetailCarousell(crawler, url);
  } else {
    throw new Error(`Unsupported URL: ${url}`);
  }
};

export { extractListing, extractDetail };

