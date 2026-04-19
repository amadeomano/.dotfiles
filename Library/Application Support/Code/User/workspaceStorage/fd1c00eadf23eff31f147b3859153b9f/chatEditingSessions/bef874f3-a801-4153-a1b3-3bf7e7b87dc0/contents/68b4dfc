#!/usr/bin/env node

const HTMLParser = require("./parse-html");

function getMeaning(meaningHTML) {
  const config = {
    num: "h2 .translation-index",
    word: "h2 strong",
    info: "h2 small",
  };

  const parser = new HTMLParser();
  const $ = parser.parseHTML(meaningHTML);
  const data = parser.extractData($, config);
  return data;
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
