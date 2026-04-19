#!/usr/bin/env node

const HTMLParser = require("./parse-html");

function getMeaning(meaningHTML) {
  console.log(
    "getMeaning called with HTML length:",
    meaningHTML ? meaningHTML.length : "null/undefined"
  );
  console.log(
    "HTML preview:",
    meaningHTML ? meaningHTML.substring(0, 100) + "..." : "No HTML"
  );

  const parser = new HTMLParser();
  const $ = parser.parseHTML(meaningHTML);

  return {
    num:
      $("h2 .translation-index").text().trim() ||
      $("h2 .translation-index").attr("content"),
    word: $("h2 strong").text().trim() || $("h2 strong").attr("content"),
    info: $("h2 small").text().trim() || $("h2 small").attr("content"),
    // Extract additional content from this meaning block
    fullText: $("h2").text().trim(),
    definitions: $("p, div")
      .map((i, el) => $(el).text().trim())
      .get()
      .filter((text) => text.length > 0),
    // You can add more selectors here based on the actual HTML structure
    examples: $(".example, .usage")
      .map((i, el) => $(el).text().trim())
      .get(),
    synonyms: $(".synonym, .similar")
      .map((i, el) => $(el).text().trim())
      .get(),
  };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const parser = new HTMLParser();
  const config = {
    word: ".word-box > h1",
    type: ".word-box > .part-of-speech",
    attrs: {
      selector: ".word-box > .attr-noun > .badge-pill",
      multiple: true,
    },
    meanings: {
      selector: ".word-row:not(:has(.word-box))",
      multiple: true,
      extractHTML: true,
      transform: (meanings) => {
        return meanings.map(getMeaning);
      },
    },
  };

  try {
    const basicResult = await parser.parseURL(args[0], config);
    console.log("Result:", JSON.stringify(basicResult.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

if (require.main === module) {
  console.log("Script started with args:", process.argv);
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}
