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
    const basicResult = await parser.parseURL(args[1], config);
    console.log("Result:", JSON.stringify(basicResult.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }

  // Run if called directly
  if (require.main === module) {
    console.log("Script started with args:", process.argv);
    main().catch((error) => {
      console.error("Unhandled error:", error);
      process.exit(1);
    });
  }
}
