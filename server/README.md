# Powell Family Tree Server

Backend server for genealogy integration features with stealth web scraping.

## Features

- **Stealth Web Scraping** - Advanced anti-detection techniques
  - Puppeteer with stealth plugin
  - Realistic browser headers
  - User agent rotation (5 different UAs)
  - Random delays (2-5 seconds)
  - Headless browser automation
- **External Genealogy Search** - Search external genealogy databases
- **Fuzzy Matching** - Match individuals using name, dates, and locations
- **Ancestor Discovery** - Follow parent links to discover new ancestors
- **CORS Enabled** - Works with frontend on different port

## Installation

```bash
cd server
npm install
```

## Running the Server

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

Server will run on http://localhost:3001

## Database Enrichment

Automatically scrape external genealogy sources and add discovered ancestors to your GEDCOM database.

### Test Run (5 people, dry run)
```bash
npm run enrich:test -- --dry-run
```

### Full Enrichment (all 4,915 people)
```bash
npm run enrich
```

### Custom Options
```bash
# Process specific number of people
node enrich-database.js --limit 50

# Dry run (don't modify database)
node enrich-database.js --dry-run

# Combine options
node enrich-database.js --limit 20 --dry-run
```

### How It Works

1. **Reads GEDCOM** - Extracts all individuals from `public/family.ged`
2. **Batch Processing** - Processes 10 people at a time with 10s delays
3. **External Search** - Uses stealth scraping to find matches on genealogy sites
4. **Confidence Matching** - Only adds matches above 70% confidence
5. **Duplicate Detection** - Skips individuals already in database
6. **Automatic Backup** - Creates timestamped backup before modifying
7. **GEDCOM Update** - Adds new ancestors with proper formatting

### Safety Features

- ✅ Creates backup before any changes (`family.backup.TIMESTAMP.ged`)
- ✅ Duplicate detection by name
- ✅ Confidence threshold filtering (70%)
- ✅ Dry run mode for testing
- ✅ Rate limiting (2-5s between requests)
- ✅ Batch delays (10s between batches)

## API Endpoints

### POST /api/genealogy/search

Search for person matches in external sources.

**Request Body:**
```json
{
  "person": {
    "name": "John Watson",
    "birth": "1845",
    "death": "1920",
    "birthPlace": "Scotland"
  }
}
```

**Response:**
```json
[
  {
    "match": true,
    "confidence": 92,
    "scores": {
      "name": 0.95,
      "birth": 1,
      "death": 0.8,
      "location": 0.9
    },
    "gedcomPerson": { ... },
    "externalPerson": { ... },
    "source": "espl-genealogy.org"
  }
]
```

### POST /api/genealogy/discover

Discover ancestors by following parent links.

**Request Body:**
```json
{
  "url": "https://www.espl-genealogy.org/mearscol/pagendxw/watson/d322.htm"
}
```

**Response:**
```json
{
  "ancestors": [...]
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T05:45:00.000Z",
  "uptime": 123.456
}
```

## Architecture

```
server/
├── server.js              # Express server & API routes
├── genealogy-scraper.js   # Web scraping utilities
├── matching-engine.js     # Fuzzy matching algorithms
└── package.json           # Dependencies
```

## Matching Algorithm

Confidence score is calculated from:

- **Name matching (40%)** - Levenshtein distance + last name bonus
- **Birth year (30%)** - ±3 year tolerance
- **Death year (20%)** - ±3 year tolerance
- **Location (10%)** - Contains/partial matching

Matches above 70% confidence are considered positive matches.

## Rate Limiting

- 1 request per 2 seconds to external sites
- Respects robots.txt and site policies

## Current Limitations

- ESPL genealogy site returns 403 Forbidden for automated requests
- Currently using mock data for demonstration
- Full scraping will require:
  - Site permission/API access
  - More robust HTML parsing
  - Better error handling

## Future Enhancements

- FamilySearch.org integration
- Ancestry.com API (if available)
- WikiTree.com support
- GEDCOM file updates
- Background job queue
- Caching layer
