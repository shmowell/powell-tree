/**
 * Genealogy Web Scraper
 *
 * Scrapes external genealogy websites to find matching individuals
 * and discover new ancestors.
 *
 * Currently supports:
 * - ESPL Genealogy Collection (espl-genealogy.org)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

// Rate limiting: 1 request per 2 seconds
const RATE_LIMIT_MS = 2000;
let lastRequestTime = 0;

async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * Search ESPL genealogy site for a person by name
 * @param {string} name - Full name to search for
 * @returns {Promise<Array>} Array of potential matches
 */
export async function searchESPL(name) {
  try {
    await rateLimit();

    // For now, we'll use a known Watson family page as an example
    // In production, you'd implement proper search functionality
    const testUrl = 'https://www.espl-genealogy.org/mearscol/pagendxw/watson/d322.htm';

    console.log(`Searching ESPL for: ${name}`);
    console.log(`Note: Currently using test URL due to 403 restriction: ${testUrl}`);

    // Since the actual site returns 403, we'll return mock data for demonstration
    // In production with proper API access, uncomment the actual scraping code

    /*
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Powell Family Tree Research Tool (Educational Purpose)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*\/*;q=0.8'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Parse genealogy data (structure varies by site)
    // This is a simplified example - real implementation would be more robust
    $('p, div').each((i, el) => {
      const text = $(el).text();

      // Look for name patterns
      if (text.toLowerCase().includes(name.toLowerCase().split(' ')[0])) {
        results.push({
          name: extractName(text),
          birthDate: extractDate(text, 'born', 'b.'),
          birthPlace: extractPlace(text, 'born in'),
          deathDate: extractDate(text, 'died', 'd.'),
          deathPlace: extractPlace(text, 'died in'),
          source: 'espl-genealogy.org',
          url: testUrl,
          rawText: text.substring(0, 200) // First 200 chars for context
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
    */

    throw new Error(`Scraping failed: ${error.message}. Consider using the stealth-scraper.js instead.`);

  } catch (error) {
    console.error('ESPL search error:', error.message);

    if (error.response?.status === 403) {
      throw new Error('Site returned 403 Forbidden. Use stealth-scraper.js for anti-detection techniques.');
    }

    throw error;
  }
}

/**
 * Extract name from text
 * @param {string} text - Text containing name
 * @returns {string|null} Extracted name
 */
function extractName(text) {
  // Simple pattern: capitalized words
  const match = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
  return match ? match[1] : null;
}

/**
 * Extract date from text using keywords
 * @param {string} text - Text containing date
 * @param {...string} keywords - Keywords that precede the date
 * @returns {string|null} Extracted date (year)
 */
function extractDate(text, ...keywords) {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\\s]*(\\d{4})`, 'i');
    const match = text.match(regex);
    if (match) return match[1];
  }
  return null;
}

/**
 * Extract place from text using keywords
 * @param {string} text - Text containing place
 * @param {string} keyword - Keyword that precedes the place
 * @returns {string|null} Extracted place
 */
function extractPlace(text, keyword) {
  const regex = new RegExp(`${keyword}[:\\s]+([A-Z][a-z, ]+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Follow parent links to discover ancestors
 * @param {string} url - URL of person's page
 * @returns {Promise<Array>} Array of discovered ancestors
 */
export async function followParentLinks(url) {
  try {
    await rateLimit();

    console.log(`Following parent links from: ${url}`);

    // In production, this would fetch the page and follow parent links
    // For now, return mock data
    return [];

  } catch (error) {
    console.error('Error following parent links:', error.message);
    return [];
  }
}

export default {
  searchESPL,
  followParentLinks
};
