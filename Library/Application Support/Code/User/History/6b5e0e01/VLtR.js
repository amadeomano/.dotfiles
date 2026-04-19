// Node.js script to fetch a URL, parse HTML, and extract parts to JSON
// Usage: node fetch_and_parse.js <URL>

const axios = require('axios');
const cheerio = require('cheerio');

async function fetchAndParse(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Example: Extract the page title and all h1 texts
    const result = {
      title: $('title').text(),
      h1: $('h1').map((i, el) => $(el).text()).get(),
    };

    return result;
  } catch (error) {
    console.error('Error fetching or parsing:', error.message);
    return null;
  }
}

if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node fetch_and_parse.js <URL>');
    process.exit(1);
  }
  fetchAndParse(url).then(result => {
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    }
  });
}
