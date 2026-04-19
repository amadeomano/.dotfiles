# HTML Parser Script

A Node.js script that fetches URLs, parses HTML content, and extracts data to JSON format.

## Features

- Fetch HTML content from any URL
- Parse HTML using CSS selectors
- Extract data with flexible configuration
- Transform extracted data with custom functions
- Save results to JSON files
- Command-line interface

## Installation

Dependencies are already installed. The script uses:
- `axios` for HTTP requests
- `cheerio` for HTML parsing (jQuery-like server-side HTML manipulation)

## Usage

### Command Line

```bash
# Basic usage - extract default data and print to console
node parse-html.js https://example.com

# Save results to a JSON file
node parse-html.js https://example.com output.json
```

### Programmatic Usage

```javascript
const HTMLParser = require('./parse-html');

const parser = new HTMLParser();

// Define what data to extract
const extractConfig = {
  title: 'title',                    // Simple selector
  headings: {
    selector: 'h1, h2, h3',          // Multiple elements
    multiple: true
  },
  price: {
    selector: '.price',
    transform: (price) => {           // Transform the data
      const match = price.match(/[\d.,]+/);
      return match ? parseFloat(match[0].replace(',', '')) : null;
    }
  },
  links: {
    selector: 'a[href]',
    attribute: 'href',               // Extract attribute instead of text
    multiple: true
  }
};

// Parse URL and extract data
const result = await parser.parseURL('https://example.com', extractConfig);
console.log(result);
```

## Extraction Configuration

The extraction configuration object defines what data to extract from the HTML:

### Simple Selector
```javascript
{
  title: 'title'  // Extracts text from <title> element
}
```

### Advanced Configuration
```javascript
{
  links: {
    selector: 'a[href]',      // CSS selector
    attribute: 'href',        // Extract attribute instead of text
    multiple: true,           // Return array of all matches
    transform: (links) => {   // Transform the extracted data
      return links.filter(link => link.startsWith('http'));
    }
  }
}
```

### Configuration Options
- `selector`: CSS selector to find elements
- `attribute`: Extract specific attribute (default: text content)
- `multiple`: Return array of all matches (default: first match only)
- `transform`: Function to transform extracted data

## Examples

See `examples.js` for pre-configured extraction setups for:
- News websites (title, author, content, tags)
- E-commerce products (name, price, description, images)
- Blog posts (title, content, categories)

## Custom Headers

You can customize HTTP headers for requests:

```javascript
const result = await parser.parseURL(url, extractConfig, {
  headers: {
    'Authorization': 'Bearer token',
    'Accept': 'text/html'
  }
});
```

## Error Handling

The script includes comprehensive error handling:
- Network errors
- Invalid URLs
- Missing elements
- Transformation errors

Failed extractions return `null` for single elements or `[]` for multiple elements.

## Output Format

```json
{
  "url": "https://example.com",
  "timestamp": "2025-05-28T18:30:00.000Z",
  "data": {
    "title": "Example Title",
    "headings": ["Heading 1", "Heading 2"],
    "links": ["https://link1.com", "https://link2.com"]
  }
}
```
