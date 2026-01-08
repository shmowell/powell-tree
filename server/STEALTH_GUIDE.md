# Stealth Web Scraping Guide

## Overview

The Powell Family Tree server uses advanced stealth techniques to access genealogy websites that block automated requests. This guide explains the anti-detection methods used.

## Why Stealth Scraping?

Many genealogy websites (including espl-genealogy.org) return 403 Forbidden errors for automated requests. They detect:
- Missing or non-browser headers
- Automated user agents
- Puppeteer/Selenium signatures
- Unusual request patterns
- Missing JavaScript execution

## Stealth Techniques Implemented

### 1. Puppeteer Stealth Plugin

Uses `puppeteer-extra-plugin-stealth` to:
- Remove `navigator.webdriver` flag
- Mask automation detection signals
- Override Chrome DevTools Protocol detection
- Spoof browser permissions
- Hide Puppeteer-specific properties

### 2. Realistic Headers

**HTTP Requests:**
```javascript
{
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Referer': 'https://www.google.com/'
}
```

### 3. User Agent Rotation

Rotates between 5 realistic user agents:
- Windows 10 + Chrome 120
- macOS + Chrome 120
- Windows 10 + Firefox 121
- macOS + Safari 17.2
- Linux + Chrome 120

### 4. Human-Like Behavior

**Random Delays:**
- 2-5 second random delay between requests
- 1-3 second delay after page load
- Mimics human reading/scrolling time

**Realistic Viewport:**
- 1920x1080 resolution
- Device scale factor: 1
- Matches common desktop setups

### 5. Fallback Strategy

The scraper uses a three-tier approach:

```
1. Stealth HTTP Request (fastest)
   ↓ (if 403 or fails)
2. Puppeteer Browser (most robust)
   ↓ (if fails)
3. Mock Data (for demonstration)
```

## How It Works

### Stealth HTTP Request

```javascript
// Attempt fast HTTP with stealth headers
const response = await stealthRequest(url);

if (response.status === 200) {
  // Parse and return data
  return parseESPLPage(response.data);
}
```

**Advantages:**
- Fast (< 1 second)
- Low resource usage
- Works for simple static sites

**Disadvantages:**
- Easier to detect
- Can't execute JavaScript
- May still get 403

### Puppeteer Browser Automation

```javascript
// Fallback to full browser
const html = await puppeteerScrape(url);
return parseESPLPage(html);
```

**Advantages:**
- Executes JavaScript
- Full browser fingerprint
- Hardest to detect
- Can handle dynamic content

**Disadvantages:**
- Slower (5-10 seconds)
- Higher CPU/memory usage
- Requires Chromium binary

## Usage

### Basic Search

```javascript
import { searchESPL } from './stealth-scraper.js';

const results = await searchESPL('John Watson');
// Automatically tries stealth HTTP → Puppeteer → Mock
```

### Follow Links

```javascript
import { followParentLinks } from './stealth-scraper.js';

const ancestors = await followParentLinks(
  'https://www.espl-genealogy.org/mearscol/pagendxw/watson/d322.htm'
);
```

## Ethical Considerations

### Rate Limiting

- **Minimum 2 seconds** between requests
- **Random delays** up to 5 seconds
- **Respects robots.txt** (when accessible)
- **Single browser instance** reused

### Best Practices

✅ **DO:**
- Use for personal research
- Respect rate limits
- Cache results
- Provide user agent identification
- Check site terms of service

❌ **DON'T:**
- Hammer the site with requests
- Run in parallel (use sequential)
- Ignore 429 (Too Many Requests)
- Download entire site
- Use for commercial purposes without permission

## Troubleshooting

### Still Getting 403

1. **Increase delays:**
   ```javascript
   const MIN_DELAY_MS = 5000; // 5 seconds
   const MAX_DELAY_MS = 10000; // 10 seconds
   ```

2. **Try different user agents**
3. **Check if site requires cookies**
4. **Verify robots.txt compliance**
5. **Contact site owner for API access**

### Puppeteer Not Working

1. **Install Chromium:**
   ```bash
   npx puppeteer browsers install chrome
   ```

2. **Check system resources:**
   - Requires 200+ MB RAM per browser instance
   - Chromium binary ~150 MB

3. **Try non-headless mode for debugging:**
   ```javascript
   headless: false // Shows browser window
   ```

### Slow Performance

1. **Use HTTP mode when possible** (falls back to Puppeteer only when needed)
2. **Cache results** in database/file
3. **Reuse browser instance** (already implemented)
4. **Limit concurrent requests**

## Detection Indicators

If you're still being detected, check:

1. **IP reputation** - Use residential proxy if needed
2. **Request frequency** - Slow down even more
3. **Header consistency** - Ensure all headers match browser type
4. **JavaScript challenges** - Some sites use advanced fingerprinting
5. **CAPTCHA** - May require manual solving

## Advanced Anti-Detection (Future)

Potential enhancements:

- **Residential proxies** - Rotate IP addresses
- **Browser profiles** - Persistent cookies/storage
- **Mouse movements** - Simulate human interaction
- **Scroll behavior** - Random scrolling patterns
- **CAPTCHA solving** - 2Captcha/Anti-Captcha integration
- **WebRTC fingerprinting** - Mask real IP
- **Canvas fingerprinting** - Randomize canvas output

## Legal Disclaimer

Web scraping legality varies by jurisdiction and website. Always:

1. Check `robots.txt`
2. Read Terms of Service
3. Respect copyright
4. Use data ethically
5. Prefer official APIs when available

This tool is for **personal genealogy research** and **educational purposes**.

## Resources

- [Puppeteer Stealth Plugin](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
- [Puppeteer Documentation](https://pptr.dev/)
- [Web Scraping Best Practices](https://www.scraperapi.com/blog/web-scraping-best-practices/)
- [robots.txt Specification](https://www.robotstxt.org/)

## Support

For issues or questions about the stealth scraper:

1. Check server logs for detailed error messages
2. Try with `headless: false` to see what's happening
3. Verify site is accessible in normal browser
4. Check if site has changed its structure
5. Consider contacting site for API access
