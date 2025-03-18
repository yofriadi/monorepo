import * as cheerio from "cheerio";
import type FirecrawlApp from "@mendable/firecrawl-js";

import type { ExtractedListingData } from "../../types";

export async function extractListing(crawler: FirecrawlApp, url: string) {
  const scrapeResult = await crawler.scrapeUrl(url, {
    formats: ["rawHtml"],
    onlyMainContent: true,
  });

  if (!scrapeResult.success) {
    throw new Error(`Failed to scrape: ${scrapeResult.error}`);
  }

  const $ = cheerio.load(scrapeResult.rawHtml || '');

  const extractedData: ExtractedListingData = {
    productLinks: [],
    nextPageLink: null,
  };
  extractedData.productLinks = extractProductLinks($);
  extractedData.nextPageLink = extractNextPageLink($);
  return extractedData;
}

const extractProductLinks = ($: cheerio.CheerioAPI) =>
  $("#wt-watches .js-article-item-container")
    .map((_, el) =>  $(el).find('a').attr("href"))
    .get();

const extractNextPageLink = ($: cheerio.CheerioAPI) => {
  const nextPageAnchor = $('nav[aria-label="Page numbers"] li a:has(span:contains("Next"))');
  const nextPageLink = nextPageAnchor.length > 0 ? nextPageAnchor.attr('href') : null;
  return nextPageLink
}

