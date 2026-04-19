#!/usr/bin/env node

const HTMLParser = require("./parse-html");

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
  };

  try {
    const basicResult = await parser.parseURL(args[1], basicConfig);
    console.log("Result:", JSON.stringify(basicResult.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}
