import * as cheerio from "cheerio";
import type FirecrawlApp from "@mendable/firecrawl-js";

import type { ExtractedListingData } from "../../types";

export async function extractListing(crawler: FirecrawlApp, url: string) {
  const scrapeResult = await crawler.scrapeUrl(url, {
    formats: ["rawHtml"],
    onlyMainContent: true,
    waitFor: 1000,
    /*actions: [
      { type: "wait", milliseconds: 5000 },
      { type: "click", selector: 'button.D_km.M_kg.D_kH' },
    ]*/
  });

  if (!scrapeResult.success) {
    throw new Error(`Failed to scrape: ${scrapeResult.error}`);
  }

  const $ = cheerio.load(scrapeResult.rawHtml || '');
  const extractedData: ExtractedListingData = {
    productLinks: [],
  };
  extractedData.productLinks = extractProductLinks($);
  return extractedData;
}

const extractProductLinks = ($: cheerio.CheerioAPI) =>
  $('.D_ox.D_qF').map((_, elem) => $(elem).find('a').attr('href') || '').get();

