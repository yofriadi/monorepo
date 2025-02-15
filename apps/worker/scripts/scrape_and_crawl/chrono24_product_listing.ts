import * as cheerio from "cheerio";
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function extractListing(url: string) {
  const scrapeResult = await app.scrapeUrl(url, {
    formats: ["rawHtml", "markdown", "links"],
    onlyMainContent: true,
  });

  if (!scrapeResult.success) {
    throw new Error(`Failed to scrape: ${scrapeResult.error}`);
  }

  const $ = cheerio.load(scrapeResult.rawHtml);

  const extractResult = {};
  extractResult.breadcrumbNavigation = extractBreadcrumbNavigation($);
  extractResult.referenceNumber = $("h1.d-inline").text().trim();
  extractResult.totalListings = $(
    ".d-flex.justify-content-between.align-items-center.m-y-4 strong",
  )
    .text()
    .trim();
  extractResult.products = extractProductData($);
  extractResult.productLinks = extractResult.products.map((product) => product.productDetailLink)
  extractResult.pagination = extractPagination($);
  extractResult.productInformation = extractProductInformation($);
  extractResult.seoContent = extractSeoContent($);
  return extractResult;
}

const extractBreadcrumbNavigation = ($) => {
  const result = [];
  $("nav.breadcrumb-container a").each((_, element) => {
    const text = $(element).text().trim();
    const link = $(element).attr("href");
    result.push({ text, link });
  });
  const referenceNumber = $("nav.breadcrumb-container span.text-ellipsis")
    .text()
    .trim();
  result.push({ text: referenceNumber });
  return result;
};

const extractProductData = ($) => {
  const container = $("#wt-watches .js-article-item-container");
  return container
    .map((_, el) => {
      const element = $(el);
      const badgeText = element
        .find(".article-item-article-badge")
        .text()
        .trim();
      const imageCarousel = element
        .find(".js-carousel img")
        .map((_, img) => $(img).attr("data-lazy-sweet-spot-master-src"))
        .get();
      const title = element.find(".text-sm.text-sm-md.text-bold").text().trim();
      const subtitle = element
        .find(".text-sm.text-sm-md.text-ellipsis")
        .text()
        .trim();
      const currency = element.find(".text-bold .currency").text().trim();
      const price = element
        .find(".text-bold")
        .text()
        .replace(currency, "")
        .trim();
      const shippingFee = element.find(".text-muted.text-sm").text().trim();
      const location = element.find(".js-tooltip").attr("data-title");
      const productDetailLink = $(el).find('a').attr("href").trim();

      return {
        badgeText,
        imageCarousel,
        title,
        subtitle,
        currency,
        price,
        shippingFee,
        location,
        productDetailLink,
      };
    })
    .get();
};

const extractPagination = ($) => {
  const pagination: {
    pages: string[];
    nextPage: string | null;
  } = {
    pages: [],
    nextPage: null,
  };
  $('.pagination li a, .pagination li span.active').each((_, element) => {
    const text = $(element).text().trim();
    if (!isNaN(text)) {
      pagination.pages.push(Number(text));
    }
  });
  pagination.nextPage = $('a.paging-next').attr('href');
  return pagination
};

const extractProductInformation = ($) => {
  const productInfo = {};
  $(".watch-details-content .col-sm-12").each((_, element) => {
    const sectionTitle = $(element).find("thead span.h3").text().trim();
    const sectionData = {};

    $(element)
      .find("tbody tr")
      .each((_, row) => {
        const key = $(row).find("td strong").text().trim().replace(/:/g, "");
        const value = $(row).find("td").last().text().trim();
        if (key) {
          sectionData[key] = value;
        }
      });

    if (sectionTitle) {
      productInfo[sectionTitle] = sectionData;
    }
  });

  return productInfo;
};

const extractSeoContent = ($) => {
  let seoContent = "";
  $(".seo-content")
    .find("*")
    .each((_, element) => {
      const tag = $(element).prop("tagName").toLowerCase();

      if (["h2", "h3", "h4", "h5", "h6"].includes(tag)) {
        seoContent += `${$(element).text().trim()}\n`;
      } else if (tag === "p") {
        seoContent += `${$(element).text().trim()}\n`;
      } else if (tag === "li") {
        seoContent += `- ${$(element).text().trim()}\n`;
      }
    });
  return seoContent;
};
