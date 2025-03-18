import * as cheerio from "cheerio";
import type FirecrawlApp from "@mendable/firecrawl-js";

interface Price {
  currency: string
  amount: number
}

interface Details {
  condition: string
  brand: string
  gender: string
  caseMaterial: string
}

interface Description {
  Price: string
  Brand: string
  Model: string
  Condition: string
  Dial: string
  "Case Diameter": string
  Material: string
  "Original Box": string
  "Original Cert/Papers": string
  Dated: string
  Warranty: string
  Remarks: string
  "Our Authenticity Guarantee": string
  "Frequently Asked Questions": string
  "Open Mon to Sun": string
  "Payment Modes": string
}

export async function extractDetail(crawler: FirecrawlApp, url: string) {
  const scrapeResult = await crawler.scrapeUrl(url, {
    formats: ["rawHtml"],
    onlyMainContent: true,
  });

  if (!scrapeResult.success) {
    throw new Error(`Failed to scrape: ${scrapeResult.error}`);
  }

  const $ = cheerio.load(scrapeResult.rawHtml || '');
  const extractedData: {
    from: 'chrono24' | 'carousell';
    imageLink: string
    title: string
    price: Price
    details: Details
    description: Description
  } = {
    from: 'carousell',
    imageLink: '',
    title: '',
    price: {} as Price,
    details: {} as Details,
    description: {} as Description,
  };
  extractedData.imageLink = extractImageLink($) || '';
  extractedData.title = extractTitle($);
  extractedData.price = extractPrice($);
  extractedData.details = extractDetails($);
  extractedData.description = extractDescription($);

  return { scrapeResult, extractedData };
}

const extractImageLink = ($: cheerio.CheerioAPI) => {
  return $('#ldp-img-0').attr('src');
}

const extractTitle = ($: cheerio.CheerioAPI) => {
  return $('h1[data-testid="new-listing-details-page-desktop-text-title"]').text().trim();
}

const extractPrice = ($: cheerio.CheerioAPI) => {
  const priceText = $('h3')
  .filter((_, el) => $(el).text().includes('S$'))
  .first()
  .text()
  .trim();

  let priceObj: Price = { currency: '', amount: 0 }; // Initialize with default values
  // Use a regular expression to separate currency and amount.
  // Example: "S$15,300" will give currency "S$" and amount "15300".
  const priceMatch = priceText.match(/^([A-Z\$]+)([\d,]+)/);
  if (priceMatch) {
    const currency = priceMatch[1];
    // Remove any commas from the number and convert to a number type.
    const amount = Number(priceMatch[2].replace(/,/g, ''));
    priceObj = { currency, amount };
  }
  return priceObj;
}

const extractDetails = ($: cheerio.CheerioAPI) => {
  const details: Details = { condition: '', brand: '', gender: '', caseMaterial: '' }; // Initialize with default values
  $('#FieldSetField-Container-field_listing_details_bp_v2 .D_aLX > div').each((_, element) => {
    // The label is in the first <p> element inside each block.
    const label = $(element).find('p').first().text().trim();
    // The value is in the first <span> element; sometimes the text might be split, so join text from <span> or <a> if needed.
    const value = $(element)
      .find('span')
      .map((_, el) => $(el).text().trim())
      .get()
      .join(' ')
      .trim();

    // Normalize the label to a camelCase key (or keep as-is if you prefer)
    if (label.toLowerCase() === 'condition') {
      details.condition = value;
    } else if (label.toLowerCase() === 'brand') {
      details.brand = value;
    } else if (label.toLowerCase() === 'gender') {
      details.gender = value;
    } else if (label.toLowerCase() === 'case material') {
      details.caseMaterial = value;
    }
  });
  return details
}

const extractDescription = ($: cheerio.CheerioAPI) => {
  const detailsElement = $('p').filter((_, el) => $(el).text().includes('Brand:')).first();

  // Extract the text from the selected element
  const detailsText = detailsElement.text();

  // Process the details text by splitting it into lines and then by ': ' to create an object.
  const detailsObject: Partial<Description> = {};
  detailsText.split('\n').forEach(line => {
    // Trim any extra whitespace from each line
    line = line.trim();
    if (line && line.includes(': ')) {
      // Split on the first occurrence of ': ' so that extra colons in the value are preserved
      const [key, ...rest] = line.split(': ');
      const typedKey = key.trim() as keyof Description;
      detailsObject[typedKey] = rest.join(': ').trim();
    }
  });
  return detailsObject as Description;
}
