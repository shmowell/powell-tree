# Powell Family Tree Server

Backend server for genealogy integration features.

## Features

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
