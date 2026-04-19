#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class HTMLParser {
  constructor() {
    this.defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
  }

  /**
   * Fetch HTML content from a URL
   * @param {string} url - The URL to fetch
   * @param {object} options - Additional options for the request
   * @returns {Promise<string>} HTML content
   */
  async fetchHTML(url, options = {}) {
    try {
      console.log(`Fetching URL: ${url}`);
      
      const config = {
        headers: { ...this.defaultHeaders, ...options.headers },
        timeout: options.timeout || 10000,
        ...options
      };

      const response = await axios.get(url, config);
      console.log(`✓ Successfully fetched ${url} (${response.status})`);
      return response.data;
    } catch (error) {
      console.error(`✗ Error fetching ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Parse HTML content using Cheerio
   * @param {string} html - HTML content to parse
   * @returns {object} Cheerio object for querying
   */
  parseHTML(html) {
    return cheerio.load(html);
  }

  /**
   * Extract data from HTML using CSS selectors
   * @param {object} $ - Cheerio object
   * @param {object} extractConfig - Configuration for data extraction
   * @returns {object} Extracted data
   */
  extractData($, extractConfig) {
    const result = {};

    for (const [key, config] of Object.entries(extractConfig)) {
      try {
        if (typeof config === 'string') {
          // Simple selector
          const element = $(config);
          result[key] = element.length > 1 ? 
            element.map((i, el) => $(el).text().trim()).get() : 
            element.text().trim();
        } else if (typeof config === 'object') {
          // Advanced configuration
          const { selector, attribute, multiple, transform } = config;
          let elements = $(selector);

          if (elements.length === 0) {
            result[key] = multiple ? [] : null;
            continue;
          }

          let data;
          if (multiple) {
            data = elements.map((i, el) => {
              const $el = $(el);
              return attribute ? $el.attr(attribute) : $el.text().trim();
            }).get();
          } else {
            const $el = elements.first();
            data = attribute ? $el.attr(attribute) : $el.text().trim();
          }

          // Apply transformation if provided
          if (transform && typeof transform === 'function') {
            data = transform(data);
          }

          result[key] = data;
        }
      } catch (error) {
        console.error(`Error extracting ${key}:`, error.message);
        result[key] = null;
      }
    }

    return result;
  }

  /**
   * Main method to fetch URL and extract data
   * @param {string} url - URL to fetch
   * @param {object} extractConfig - Configuration for data extraction
   * @param {object} options - Additional options
   * @returns {Promise<object>} Extracted data
   */
  async parseURL(url, extractConfig, options = {}) {
    try {
      const html = await this.fetchHTML(url, options);
      const $ = this.parseHTML(html);
      const extractedData = this.extractData($, extractConfig);

      const result = {
        url,
        timestamp: new Date().toISOString(),
        data: extractedData
      };

      // Save to file if specified
      if (options.outputFile) {
        await this.saveToFile(result, options.outputFile);
      }

      return result;
    } catch (error) {
      console.error('Error in parseURL:', error.message);
      throw error;
    }
  }

  /**
   * Save extracted data to JSON file
   * @param {object} data - Data to save
   * @param {string} filename - Output filename
   */
  async saveToFile(data, filename) {
    try {
      const outputPath = path.resolve(filename);
      await fs.promises.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✓ Data saved to ${outputPath}`);
    } catch (error) {
      console.error('Error saving file:', error.message);
      throw error;
    }
  }
}

// Example usage and CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node parse-html.js <URL> [output-file]

Examples:
  node parse-html.js https://example.com
  node parse-html.js https://example.com output.json

You can also use this script programmatically by requiring it as a module.
    `);
    process.exit(1);
  }

  const url = args[0];
  const outputFile = args[1];

  const parser = new HTMLParser();

  // Example extraction configuration
  // Modify this based on what you want to extract
  const extractConfig = {
    title: 'title',
    headings: {
      selector: 'h1, h2, h3',
      multiple: true
    },
    links: {
      selector: 'a[href]',
      attribute: 'href',
      multiple: true,
      transform: (links) => links.filter(link => link.startsWith('http'))
    },
    images: {
      selector: 'img[src]',
      attribute: 'src',
      multiple: true
    },
    paragraphs: {
      selector: 'p',
      multiple: true,
      transform: (paragraphs) => paragraphs.filter(p => p.length > 20)
    },
    meta: {
      description: 'meta[name="description"]',
      keywords: 'meta[name="keywords"]'
    }
  };

  try {
    const result = await parser.parseURL(url, extractConfig, {
      outputFile: outputFile
    });

    if (!outputFile) {
      console.log('\n--- Extracted Data ---');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = HTMLParser;
