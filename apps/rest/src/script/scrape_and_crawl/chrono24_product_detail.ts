import * as cheerio from "cheerio";
import type FirecrawlApp from "@mendable/firecrawl-js";

interface Price {
  currency: string
  amount: number
}

export async function extractDetail(crawler: FirecrawlApp, url: string) {
  const scrapeResult = await crawler.scrapeUrl(url, {
    formats: ["rawHtml"],
    onlyMainContent: true,
  });

  if (!scrapeResult.success) {
    throw new Error(`Failed to scrape: ${scrapeResult.error}`);
  }

  const $ = cheerio.load(scrapeResult.rawHtml || "");
  const extractedData: {
    from: 'chrono24' | 'carousell';
    currency: string;
    price: Price;
    imageCarouselLinks: string[];
    condition: string;
    productInformation: ProductInformation;
  } = {
    from: 'chrono24',
    currency: "",
    price: {} as Price,
    imageCarouselLinks: [],
    condition: "",
    productInformation: {} as ProductInformation,
  };
  extractedData.price = extractPrice($);
  extractedData.imageCarouselLinks = extractImageCarouselLinks($);
  extractedData.condition = extractCondition($);
  extractedData.productInformation = extractProductInformation($);
  return extractedData;
}

const cleanText = (text: string) => text.trim().replace(/\s+/g, " ");

const extractPrice = ($: cheerio.CheerioAPI) => {
  const priceElement = $(".detail-page-price .js-price-shipping-country");
  const currency = priceElement.find(".currency").text().trim();
  return {
    currency,
    amount: Number(priceElement
    .text()
    .replace(currency, "")
    .trim()
    .replace(/,/g, "")),
  };
};

const extractImageCarouselLinks = ($: cheerio.CheerioAPI) => {
  const links: string[] = [];
  $(".carousel-thumb-nav-image.h-100").each((_, element) => {
    const backgroundImage = $(element).css("background-image") || "";
    const urlMatch = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    if (urlMatch && urlMatch[1]) {
      links.push(urlMatch[1]);
    }
  });
  return links;
};

const extractCondition = ($: cheerio.CheerioAPI): string =>
  $(".js-conditions").text();

interface ProductInformation {
  "Basic Info": BasicInfo;
  Caliber: Caliber;
  Case: Case;
  "Bracelet/strap": BraceletStrap;
  Description: string;
}

interface BasicInfo {
  "Listing code": string;
  Brand: string;
  Model: string;
  "Reference number": string;
  Movement: string;
  "Case material": string;
  "Bracelet material": string;
  "Year of production": string;
  Condition: string;
  "Most Recent Servicing": string;
  "Scope of delivery": string;
  Gender: string;
  Location: string;
  Price: string;
  Availability: string;
}

interface Caliber {
  Movement: string;
}

interface Case {
  "Case material": string;
  "Case diameter": string;
  Dial: string;
}

interface BraceletStrap {
  "Bracelet material": string;
  "Bracelet color": string;
  "Clasp material": string;
}

const extractProductInformation = (
  $: cheerio.CheerioAPI,
): ProductInformation => {
  const productInformation: Record<string, any> = {};

  $(".js-tab-panel.active table tbody").each((_, tbody) => {
    let currentSection: string | null = null;

    $(tbody)
      .find("tr")
      .each((_, tr) => {
        const headerCell = $(tr).find('td[colspan="2"] h3').text().trim();

        if (headerCell) {
          currentSection = headerCell;
          if (!productInformation[currentSection]) {
            productInformation[currentSection] = {};
          }
        } else if (currentSection) {
          const header = $(tr).find("td:first-child strong").text().trim();
          let value = $(tr).find("td:nth-child(2) span").first().text().trim();
          if (!value) {
            value = $(tr).find("td:nth-child(2)").text().trim();
          }

          if (header) {
            if (typeof productInformation[currentSection] === "object") {
              productInformation[currentSection][header] = cleanText(value);
            }
          } else if ($(tr).find("td").length === 1) {
            if (currentSection === "Description") {
              productInformation.Description = cleanText(
                $(tr).find("td").text(),
              );
            }
          }
        }
      });
  });

  productInformation.Description = $(".js-watch-notes").text().trim();

  return productInformation as ProductInformation;
};
