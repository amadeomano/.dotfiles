#!/usr/bin/env node

const HTMLParser = require("./parse-html");

// Main execution
async function main() {
  const parser = new HTMLParser();
  const config = {
    word: ".word-box > h1",
    type: ".word-box > .part-of-speech",
    attrs: {
      selector: ".word-box > .attr-noun > .badge-pill",
      multiple: true,
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
}
