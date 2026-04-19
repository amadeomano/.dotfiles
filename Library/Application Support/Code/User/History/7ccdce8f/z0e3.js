#!/usr/bin/env node

const HTMLParser = require("./parse-html");

function getExample(exampleHTML) {
  const config = {
    phrase: ".example-box",
    meaning: ".translation-example-box",
  };

  const parser = new HTMLParser();
  const $ = parser.parseHTML(exampleHTML);
  const data = parser.extractData($, config);
  return data;
}

function getMeaning(meaningHTML) {
  const config = {
    num: "h2 .translation-index",
    word: "h2 strong",
    info: "h2 small",
    examples: {
      selector: "ul li",
      multiple: true,
      extractHTML: true,
      transform: (examples) => examples.map(getExample),
    },
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
      selector: ".word-box > [class^='attr-'] > .badge-pill",
      multiple: true,
    },
    helper: ".word-box > .small",
    meanings: {
      selector: ".word-row:has(.translation-index)",
      multiple: true,
      extractHTML: true,
      transform: (meanings) => meanings.map(getMeaning),
    },
  };

  try {
    const basicResult = await parser.parseURL(args[0], config);
    console.log("Result:", JSON.stringify(basicResult.data, null, 2));
    if (args[1]) {
      await parser.saveToFile(basicResult.data, args[1]);
      console.log(`Data saved to ${args[1]}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}
