#!/usr/bin/env node

const HTMLParser = require("./parse-html");

// Function to parse individual meaning HTML blocks
function parseMeaning(meaningHtml, $parent) {
  console.log("Processing meaning HTML length:", meaningHtml ? meaningHtml.length : 0);
  
  if (!meaningHtml) return null;
  
  const parser = new HTMLParser();
  const $ = parser.parseHTML(meaningHtml);
  
  return {
    num: $("h2 .translation-index").text().trim() || $("h2 .translation-index").attr("content") || null,
    word: $("h2 strong").text().trim() || $("h2 strong").attr("content") || null,
    info: $("h2 small").text().trim() || $("h2 small").attr("content") || null,
    fullContent: $("h2").text().trim() || null,
    // Extract any additional content from this meaning block
    paragraphs: $("p").map((i, el) => $(el).text().trim()).get().filter(text => text.length > 0),
    divs: $("div").map((i, el) => $(el).text().trim()).get().filter(text => text.length > 0),
    // Raw HTML for debugging
    rawHtml: meaningHtml.substring(0, 200) + (meaningHtml.length > 200 ? "..." : "")
  };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (!args[0]) {
    console.log("Usage: node bamooz.js <URL>");
    process.exit(1);
  }
  
  const parser = new HTMLParser();
  
  // Configuration for extraction
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
      extractHTML: true, // This tells the parser to extract HTML content
      transform: (meaningHtmlArray, $) => {
        // Each item in meaningHtmlArray is the HTML content of a meaning element
        return meaningHtmlArray.map(meaningHtml => parseMeaning(meaningHtml, $));
      },
    },
  };

  try {
    const result = await parser.parseURL(args[0], config);
    console.log("\n=== EXTRACTION RESULT ===");
    console.log(JSON.stringify(result.data, null, 2));
    
    // Also show some statistics
    console.log("\n=== STATISTICS ===");
    console.log(`Word: ${result.data.word}`);
    console.log(`Type: ${result.data.type}`);
    console.log(`Attributes: ${result.data.attrs ? result.data.attrs.length : 0}`);
    console.log(`Meanings found: ${result.data.meanings ? result.data.meanings.length : 0}`);
    
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

if (require.main === module) {
  console.log("Script started with args:", process.argv);
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}
