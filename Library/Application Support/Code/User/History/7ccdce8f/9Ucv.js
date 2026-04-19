#!/usr/bin/env node

const HTMLParser = require("./parse-html");

// Create a global parser instance for nested parsing
const globalParser = new HTMLParser();

function getMeaning(meaningHtml) {
  console.log("Processing meaning HTML:", meaningHtml.substring(0, 100) + "...");
  const $ = globalParser.parseHTML(meaningHtml);
  
  return {
    num: $("h2 .translation-index").text().trim() || $("h2 .translation-index").attr("content"),
    word: $("h2 strong").text().trim() || $("h2 strong").attr("content"), 
    info: $("h2 small").text().trim() || $("h2 small").attr("content"),
    // Add more fields as needed
    fullContent: $("h2").text().trim(),
    // Extract any additional data from this meaning block
    details: $("p, div").map((i, el) => $(el).text().trim()).get().filter(text => text.length > 0)
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
      transform: (meanings) => meanings.map(getMeaning),
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
