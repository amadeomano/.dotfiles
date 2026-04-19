#!/usr/bin/env node

const HTMLParser = require("./parse-html");

// Main execution
async function main() {
  const parser = new HTMLParser();
  const config = {
    word: "body > div.container.mt-2 > div:nth-child(1) > div > div > div > h1",
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
}
