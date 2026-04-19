const HTMLParser = require("./parse-html");

// Example of using the HTMLParser with custom extraction configurations

async function exampleUsage() {
  const parser = new HTMLParser();

  // Example 1: News website extraction
  const newsConfig = {
    title: "h1",
    author: ".author, .byline",
    publishDate: "time[datetime], .publish-date",
    content: {
      selector: ".article-content p, .story-body p",
      multiple: true,
      transform: (paragraphs) => paragraphs.join("\n\n"),
    },
    tags: {
      selector: ".tags a, .category a",
      multiple: true,
    },
  };

  // Example 2: E-commerce product extraction
  const productConfig = {
    name: "h1.product-title",
    price: {
      selector: ".price, .current-price",
      transform: (price) => {
        const match = price.match(/[\d.,]+/);
        return match ? parseFloat(match[0].replace(",", "")) : null;
      },
    },
    description: ".product-description",
    images: {
      selector: ".product-images img",
      attribute: "src",
      multiple: true,
    },
    availability: ".stock-status, .availability",
    rating: {
      selector: ".rating, .stars",
      transform: (rating) => {
        const match = rating.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : null;
      },
    },
  };

  // Example 3: Blog post extraction
  const blogConfig = {
    title: "h1",
    content: {
      selector: ".post-content, .entry-content",
      transform: (content) => content.replace(/\s+/g, " ").trim(),
    },
    categories: {
      selector: ".categories a, .tags a",
      multiple: true,
    },
    readTime: ".read-time, .reading-time",
  };

  // Example usage
  try {
    // Replace with actual URLs
    // const newsData = await parser.parseURL('https://example-news.com/article', newsConfig);
    // const productData = await parser.parseURL('https://example-shop.com/product', productConfig);
    // const blogData = await parser.parseURL('https://example-blog.com/post', blogConfig);

    console.log(
      "Example configurations created. Replace URLs with actual websites to test."
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Custom extraction function example
async function customExtraction(url) {
  const parser = new HTMLParser();

  try {
    const html = await parser.fetchHTML(url);
    const $ = parser.parseHTML(html);

    // Custom extraction logic
    const customData = {
      pageTitle: $("title").text(),
      wordCount: $("body").text().split(/\s+/).length,
      linkCount: $("a").length,
      imageCount: $("img").length,
      hasForm: $("form").length > 0,
      externalLinks: $('a[href^="http"]')
        .map((i, el) => $(el).attr("href"))
        .get(),
      socialLinks: $(
        'a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"]'
      )
        .map((i, el) => ({
          platform: $(el).attr("href").includes("facebook")
            ? "facebook"
            : $(el).attr("href").includes("twitter")
            ? "twitter"
            : "linkedin",
          url: $(el).attr("href"),
        }))
        .get(),
    };

    return customData;
  } catch (error) {
    console.error("Custom extraction failed:", error.message);
    throw error;
  }
}

module.exports = {
  newsConfig,
  productConfig,
  blogConfig,
  customExtraction,
};
