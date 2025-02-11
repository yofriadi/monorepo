import * as cheerio from "cheerio";
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function extractDetail(url: string) {
  const scrapeResult = await app.scrapeUrl(url, {
    formats: ["rawHtml", "markdown", "links"],
    onlyMainContent: true,
  });

  if (!scrapeResult.success) {
    throw new Error(`Failed to scrape: ${scrapeResult.error}`);
  }

  const $ = cheerio.load(scrapeResult.rawHtml);
  const result = {};
  const priceElement = $(".detail-page-price .js-price-shipping-country");
  const currency = priceElement.find(".currency").text().trim();
  result.currency = currency;
  result.price = priceElement
    .text()
    .replace(currency, "")
    .trim()
    .replace(/,/g, "");
  result.breadcrumbNavigation = extractBreadcrumbNavigation($);
  result.imageCarouselLinks = extractImageCarouselLinks($);
  result.condition = extractCondition($);
  result.productInformation = extractProductInformation($);
  result.dealerInformation = extractDealerInformation($);
  result.dealerRating = extractDealerRating($);
  return result;
}

const cleanText = (text) => text.trim().replace(/\s+/g, " ");

const extractBreadcrumbNavigation = ($) => {
  const breadcrumbNavigation = [];
  $("nav.breadcrumb-container a").each((_, element) => {
    const text = $(element).text().trim();
    const link = $(element).attr("href");
    breadcrumbNavigation.push({ text, link });
  });
  return breadcrumbNavigation;
};

const extractImageCarouselLinks = ($) => {
  const links = [];
  $(".carousel-thumb-nav-image.h-100").each((index, element) => {
    const backgroundImage = $(element).css("background-image");
    const urlMatch = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    if (urlMatch && urlMatch[1]) {
      links.push(urlMatch[1]);
    }
  });
  return links;
};

const extractCondition = ($) => {
  const conditionSection = $('section.m-b-4');
  const conditionDetails = conditionSection.find('span').map((index, element) => {
    return $(element).text().trim();
  }).get();
  return conditionDetails;
}

const extractProductInformation = ($) => {
  const productInformation = {};
  $(".js-tab-panel.active table tbody").each((_, tbody) => {
    let currentSection = null;

    $(tbody)
      .find("tr")
      .each((_, tr) => {
        const headerCell = $(tr).find('td[colspan="2"] h3').text().trim();

        if (headerCell) {
          currentSection = headerCell;
          productInformation[currentSection] = {};
        } else if (currentSection) {
          // Process key-value pairs within the current section
          const header = $(tr).find("td:first-child strong").text().trim();
          const value = $(tr).find("td:nth-child(2)").text().trim();

          if (header) {
            productInformation[currentSection][header] = cleanText(value);
          } else if ($(tr).find("td").length === 1) {
            // Handle single-cell rows like "Functions" or "Other"
            productInformation[currentSection] = cleanText(
              $(tr).find("td").text(),
            );
          }
        }
      });
  });
  productInformation.Description = $(".js-watch-notes").text().trim();
  return productInformation;
};

const extractDealerInformation = ($) => {
  const dealerInformation = {};
  dealerInformation.image = $(".dealer-logo .img-responsive").attr("src");
  dealerInformation.name = $(".text-xlg.text-bold a").text().trim();
  dealerInformation.status = $(".text-muted.m-b-5.m-b-lg-4").text().trim();
  dealerInformation.watchesSold = $(".border .text-bold.text-xlg")
    .first()
    .text()
    .trim();
  dealerInformation.activeListings = $(".border .text-bold.text-xlg")
    .last()
    .text()
    .trim();
  dealerInformation.location = $(".i-location").parent().text().trim();
  return dealerInformation;
};

const extractDealerRating = ($) => {
  const dealerRating = {};
  const reviewsText = $("button.js-link-merchant-reviews").text().trim();
  dealerRating.totalReviews = parseInt(reviewsText, 10);
  dealerRating.totalStarsRating = $(".wt-rating-stats .rating").text().trim();
  dealerRating.shippingRating = $('.m-b-2:contains("Shipping") strong')
    .text()
    .trim();
  dealerRating.itemDescriptionRating = $(
    '.m-b-2:contains("Item description") strong',
  )
    .text()
    .trim();
  dealerRating.communicationRating = $(
    '.m-b-2:contains("Communication") strong',
  )
    .text()
    .trim();
  dealerRating.totalBuyerRecommendation = $(".m-t-3.m-t-sm-5 strong")
    .text()
    .replace("buyers recommend this seller", "")
    .trim();
  dealerRating.starRatings = {};
  $("table.tabel-ratings tbody tr").each((index, element) => {
    const stars = $(element).find("td:first-child span").text().trim();
    const totalReviews = $(element)
      .find("td button")
      .text()
      .replace(/\(|\)/g, "")
      .trim();
    dealerRating.starRatings[stars] = totalReviews;
  });
  return dealerRating;
};
