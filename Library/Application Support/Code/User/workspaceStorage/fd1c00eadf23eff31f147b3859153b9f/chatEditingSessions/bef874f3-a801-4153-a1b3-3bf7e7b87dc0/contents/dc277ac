#!/usr/bin/env node

const HTMLParser = require("./parse-html");

async function demonstrateUsage() {
  console.log("🚀 HTML Parser Demonstration\n");

  const parser = new HTMLParser();

  // Example 1: Basic website information
  console.log("📄 Example 1: Basic Website Information");
  const basicConfig = {
    title: "title",
    description: {
      selector: 'meta[name="description"]',
      attribute: "content",
    },
    headings: {
      selector: "h1, h2, h3",
      multiple: true,
    },
    linkCount: {
      selector: "a",
      transform: (elements) => elements.length,
    },
  };

  try {
    const basicResult = await parser.parseURL(
      "https://example.com",
      basicConfig
    );
    console.log("Result:", JSON.stringify(basicResult.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Example 2: Custom extraction with transformations
  console.log("🔧 Example 2: Custom Data Transformations");
  const transformConfig = {
    pageStats: {
      selector: "body",
      transform: (bodyText) => {
        const words = bodyText.trim().split(/\s+/).length;
        const characters = bodyText.length;
        return {
          wordCount: words,
          characterCount: characters,
          estimatedReadTime: Math.ceil(words / 200), // words per minute
        };
      },
    },
    socialLinks: {
      selector:
        'a[href*="twitter"], a[href*="facebook"], a[href*="linkedin"], a[href*="instagram"]',
      attribute: "href",
      multiple: true,
      transform: (links) => {
        return links.map((link) => {
          let platform = "unknown";
          if (link.includes("twitter")) platform = "twitter";
          else if (link.includes("facebook")) platform = "facebook";
          else if (link.includes("linkedin")) platform = "linkedin";
          else if (link.includes("instagram")) platform = "instagram";

          return { platform, url: link };
        });
      },
    },
  };

  try {
    const transformResult = await parser.parseURL(
      "https://github.com",
      transformConfig
    );
    console.log("Result:", JSON.stringify(transformResult.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Example 3: E-commerce style extraction
  console.log("🛒 Example 3: Structured Data Extraction");
  const structuredConfig = {
    navigation: {
      selector: "nav a, .nav a, .navigation a",
      multiple: true,
    },
    content: {
      selector: "main, .main, .content, article",
      transform: (content) => {
        return content.substring(0, 200) + (content.length > 200 ? "..." : "");
      },
    },
    images: {
      selector: "img[src]",
      attribute: "src",
      multiple: true,
      transform: (srcs) => {
        return srcs
          .filter((src) => !src.includes("data:"))
          .map((src) =>
            src.startsWith("http") ? src : `https://example.com${src}`
          );
      },
    },
  };

  try {
    const structuredResult = await parser.parseURL(
      "https://example.com",
      structuredConfig
    );
    console.log("Result:", JSON.stringify(structuredResult.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Custom extraction function for specific use cases
async function customExtractionExample(url) {
  console.log(`\n🎯 Custom Extraction for: ${url}\n`);

  const parser = new HTMLParser();

  try {
    const html = await parser.fetchHTML(url);
    const $ = parser.parseHTML(html);

    // Custom analysis
    const analysis = {
      pageTitle: $("title").text(),
      hasForm: $("form").length > 0,
      hasSearch: $('input[type="search"], input[name*="search"]').length > 0,
      externalLinks: $('a[href^="http"]').filter((i, el) => {
        const href = $(el).attr("href");
        return !href.includes(new URL(url).hostname);
      }).length,
      internalLinks: $('a[href^="/"], a[href^="./"], a[href^="../"]').length,
      scripts: $("script[src]")
        .map((i, el) => $(el).attr("src"))
        .get(),
      stylesheets: $('link[rel="stylesheet"]')
        .map((i, el) => $(el).attr("href"))
        .get(),
      metaTags: $("meta")
        .map((i, el) => {
          const $el = $(el);
          const name =
            $el.attr("name") || $el.attr("property") || $el.attr("http-equiv");
          const content = $el.attr("content");
          return name ? { name, content } : null;
        })
        .get()
        .filter(Boolean),
    };

    console.log("Custom Analysis Result:");
    console.log(JSON.stringify(analysis, null, 2));

    return analysis;
  } catch (error) {
    console.error("Custom extraction failed:", error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0 && args[0] === "--custom") {
    const url = args[1] || "https://example.com";
    await customExtractionExample(url);
  } else if (args.length > 0) {
    const url = args[0];
    await customExtractionExample(url);
  } else {
    await demonstrateUsage();
  }
}

if (require.main === module) {
  console.log("Demo script starting...");
  main().catch((error) => {
    console.error("Demo failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  });
}

module.exports = { demonstrateUsage, customExtractionExample };
