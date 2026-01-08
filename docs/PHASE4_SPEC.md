# Phase 4: User Expansion & External Genealogy Integration

## Overview

Phase 4 adds support for a new user (Kathy Barker) and implements a powerful genealogy data enrichment tool that integrates with external genealogy websites to expand the family tree with additional ancestors and historical records.

**Status:** 📋 Planned
**Focus:** New user integration, external data enrichment
**Complexity:** High
**Priority:** Medium
**Estimated Timeline:** 2-3 weeks

---

## Goals

1. **Add Kathy Barker User View** — Enable Kathy Barker to explore her ancestry
2. **External Genealogy Integration** — Build tool to match and enrich data from external sources
3. **Data Validation** — Ensure accuracy when importing external genealogy records
4. **Ancestor Discovery** — Automatically find and suggest new ancestors from external sources

---

## Feature 1: Add Kathy Barker User

### Requirements

**User Story:**
> As Kathy Barker, I want to view my own family tree starting from me as the root person, so I can explore my ancestry alongside other family members.

### Implementation Steps

#### 1.1 Locate Kathy Barker in GEDCOM Data

**Task:** Find Kathy Barker's individual ID in `public/family.ged`

```bash
# Search for Kathy Barker or related Barker family members
grep -i "kathy\|kathleen" public/family.ged | grep -i "barker"
```

**Expected Result:** Individual ID (e.g., `@I123@`) for Kathy Barker

**If Not Found:** Search for related Barker family members and trace relationships:

- Larry Douglas Barker (found as `@I9@`)
- Claude Barker
- Michael Barker

#### 1.2 Update User Configuration

**Files to Modify:**

1. `src/App.jsx` (react-d3-tree version)
2. `src/AppReactFlow.jsx` (React Flow version)

**Changes:**

```javascript
// Add to userConfig object
const userConfig = {
  william_theodore: { name: 'William Theodore Powell', label: 'William Theodore Powell' },
  kristen: { name: 'Kristen Elizabeth Powell', label: 'Kristen Elizabeth Powell' },
  victoria: { name: 'Victoria Maria Powell', label: 'Victoria Maria Powell' },
  william_jordan: { name: 'William Jordan Powell', label: 'William Jordan Powell' },
  kathy_barker: { name: 'Kathy Barker', label: 'Kathy Barker' }, // NEW
};
```

**Default User:** Update to Kathy Barker initially for testing:

```javascript
const [currentUser, setCurrentUser] = useState('kathy_barker');
```

#### 1.3 Testing Checklist

- [ ] Kathy Barker appears in user dropdown
- [ ] Selecting Kathy Barker loads her ancestry tree
- [ ] Tree displays correctly with her as root
- [ ] All existing features work (search, breadcrumbs, expand/collapse)
- [ ] Generation control works correctly
- [ ] Detail panel shows correct information
- [ ] Pan and zoom function properly

#### 1.4 Edge Cases

**If Kathy Barker Not Found:**

1. Search for spouse/children connections
2. Check maiden name or alternate spellings
3. Verify GEDCOM data completeness
4. Consider adding manually if data is missing

**If Limited Ancestry:**

- Display message: "Limited ancestry data available for Kathy Barker"
- Suggest using external genealogy integration tool (Feature 2)

---

## Feature 2: External Genealogy Integration Tool

### Requirements

**User Story:**
> As a genealogy researcher, I want to automatically match individuals in my tree with external genealogy databases, so I can discover new ancestors and enrich existing records without manual searching.

### Overview

Build a tool that:

1. **Scrapes External Genealogy Sites** — Extract data from sites like espl-genealogy.org
2. **Matches Individuals** — Fuzzy matching by name, dates, locations
3. **Discovers New Ancestors** — Follows genealogy links to find parents, grandparents
4. **Enriches Records** — Adds birth/death dates, locations, occupations
5. **Validates Data** — Confidence scoring and user review before importing

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Powell Family Tree App                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Genealogy Integration Dashboard              │  │
│  │  - Search for matches                                  │  │
│  │  - Review suggested ancestors                          │  │
│  │  - Approve/reject matches                              │  │
│  │  - View confidence scores                              │  │
│  └────────────────────────────────────────────────────────┘  │
│                            │                                  │
│                            ▼                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │        Genealogy Matching Engine (Backend)             │  │
│  │  - Parse GEDCOM individuals                            │  │
│  │  - Scrape external sites                               │  │
│  │  - Fuzzy name matching                                 │  │
│  │  - Date/location validation                            │  │
│  │  - Confidence scoring                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                            │                                  │
│                            ▼                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            External Genealogy Sources                  │  │
│  │  - espl-genealogy.org (Watson family)                  │  │
│  │  - FamilySearch.org                                    │  │
│  │  - Ancestry.com (if API available)                     │  │
│  │  - WikiTree.com                                        │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Plan

#### 2.1 Backend Scraping Service

**Technology:** Node.js + Express + Puppeteer/Cheerio

**File:** `server/genealogy-scraper.js`

**Responsibilities:**

- Fetch HTML from genealogy websites
- Parse genealogy records (names, dates, relationships)
- Extract parent/child links
- Return structured JSON data

**Example Output:**

```json
{
  "source": "espl-genealogy.org",
  "url": "https://www.espl-genealogy.org/mearscol/pagendxw/watson/d322.htm#P323",
  "individual": {
    "name": "John Watson",
    "birthDate": "1845",
    "birthPlace": "Scotland",
    "deathDate": "1920",
    "deathPlace": "Pennsylvania, USA",
    "parents": [
      {
        "name": "William Watson",
        "url": "/watson/d320.htm#P321"
      },
      {
        "name": "Mary Thompson",
        "url": "/watson/d320.htm#P322"
      }
    ],
    "spouse": "Elizabeth Brown",
    "children": ["James Watson", "Sarah Watson"]
  }
}
```

#### 2.2 Matching Algorithm

**File:** `server/matching-engine.js`

**Algorithm:**

```javascript
function matchIndividual(gedcomPerson, externalPerson) {
  let confidence = 0;

  // Name matching (fuzzy)
  const nameScore = fuzzyMatch(gedcomPerson.name, externalPerson.name);
  confidence += nameScore * 40; // 40% weight

  // Birth year matching (±3 years tolerance)
  const birthScore = dateMatch(gedcomPerson.birth, externalPerson.birthDate, 3);
  confidence += birthScore * 30; // 30% weight

  // Death year matching (±3 years tolerance)
  const deathScore = dateMatch(gedcomPerson.death, externalPerson.deathDate, 3);
  confidence += deathScore * 20; // 20% weight

  // Location matching
  const locationScore = locationMatch(gedcomPerson.birthPlace, externalPerson.birthPlace);
  confidence += locationScore * 10; // 10% weight

  return {
    match: confidence > 70, // 70% threshold
    confidence: confidence,
    gedcomPerson: gedcomPerson,
    externalPerson: externalPerson
  };
}

function fuzzyMatch(str1, str2) {
  // Levenshtein distance or similar algorithm
  const distance = levenshtein(str1.toLowerCase(), str2.toLowerCase());
  const maxLen = Math.max(str1.length, str2.length);
  return 1 - (distance / maxLen); // 0-1 score
}

function dateMatch(date1, date2, tolerance) {
  if (!date1 || !date2) return 0;
  const year1 = parseInt(date1);
  const year2 = parseInt(date2);
  if (isNaN(year1) || isNaN(year2)) return 0;
  const diff = Math.abs(year1 - year2);
  if (diff <= tolerance) return 1;
  return Math.max(0, 1 - (diff / 10)); // Gradual falloff
}

function locationMatch(loc1, loc2) {
  if (!loc1 || !loc2) return 0;
  // Simple contains check (can be improved)
  return loc1.toLowerCase().includes(loc2.toLowerCase()) ||
         loc2.toLowerCase().includes(loc1.toLowerCase()) ? 1 : 0;
}
```

#### 2.3 Frontend Dashboard

**File:** `src/components/GenealogyIntegration.jsx`

**UI Components:**

1. **Search Tab**
   - Input: Person name from tree
   - Button: "Search External Sources"
   - Results: List of potential matches with confidence scores

2. **Matches Tab**
   - Table of matched individuals
   - Columns: Name, Birth, Death, Source, Confidence, Actions
   - Actions: View Details, Approve, Reject

3. **Discoveries Tab**
   - New ancestors found via parent links
   - Family tree preview showing new connections
   - Batch approve/import

4. **Settings Tab**
   - Select external sources
   - Configure matching thresholds
   - Set confidence requirements

**Example UI:**

```jsx
import React, { useState } from 'react';

export function GenealogyIntegration({ individuals, onImport }) {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const handleSearch = async (personId) => {
    const person = individuals[personId];

    // Call backend API
    const response = await fetch('/api/genealogy/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person })
    });

    const results = await response.json();
    setSearchResults(results);
  };

  const handleApprove = async (match) => {
    // Import matched data into GEDCOM
    await fetch('/api/genealogy/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match })
    });

    // Refresh tree
    onImport();
  };

  return (
    <div className="p-6 bg-white rounded-2xl border-2 border-heritage-border">
      <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'EB Garamond' }}>
        External Genealogy Integration
      </h2>

      {/* Person Selector */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Select Person to Search</label>
        <select
          onChange={(e) => setSelectedPerson(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-heritage-border"
        >
          <option>Choose a person...</option>
          {Object.entries(individuals).map(([id, person]) => (
            <option key={id} value={id}>{person.name}</option>
          ))}
        </select>
        <button
          onClick={() => handleSearch(selectedPerson)}
          className="mt-3 px-6 py-2 bg-heritage-ivy text-white rounded-lg hover:bg-heritage-ivy-light"
        >
          Search External Sources
        </button>
      </div>

      {/* Results Table */}
      {searchResults.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Potential Matches</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-heritage-cream border-b-2 border-heritage-border">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Birth</th>
                <th className="p-3 text-left">Death</th>
                <th className="p-3 text-left">Source</th>
                <th className="p-3 text-left">Confidence</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((result, idx) => (
                <tr key={idx} className="border-b border-heritage-border hover:bg-heritage-cream/50">
                  <td className="p-3">{result.externalPerson.name}</td>
                  <td className="p-3">{result.externalPerson.birthDate}</td>
                  <td className="p-3">{result.externalPerson.deathDate}</td>
                  <td className="p-3">{result.source}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded ${
                      result.confidence > 90 ? 'bg-green-100 text-green-800' :
                      result.confidence > 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.confidence.toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleApprove(result)}
                      className="px-3 py-1 bg-heritage-ivy text-white rounded hover:bg-heritage-ivy-light mr-2"
                    >
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-stone-200 text-stone-700 rounded hover:bg-stone-300">
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

#### 2.4 Backend API Endpoints

**File:** `server/api.js`

```javascript
const express = require('express');
const router = express.Router();
const scraper = require('./genealogy-scraper');
const matcher = require('./matching-engine');

// Search for matches
router.post('/api/genealogy/search', async (req, res) => {
  const { person } = req.body;

  try {
    // Scrape external sources
    const externalData = await scraper.searchESPL(person.name);

    // Match against GEDCOM person
    const matches = externalData.map(ext => matcher.matchIndividual(person, ext))
      .filter(m => m.confidence > 70)
      .sort((a, b) => b.confidence - a.confidence);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import approved match
router.post('/api/genealogy/import', async (req, res) => {
  const { match } = req.body;

  try {
    // Update GEDCOM file with new data
    await gedcomUpdater.addIndividual(match.externalPerson);

    // Follow parent links to discover ancestors
    const ancestors = await scraper.followParentLinks(match.externalPerson.url);

    res.json({ success: true, ancestorsDiscovered: ancestors.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### 2.5 GEDCOM Update Utility

**File:** `server/gedcom-updater.js`

**Responsibilities:**

- Parse existing GEDCOM file
- Add new individuals with proper formatting
- Link new individuals to existing family structures
- Maintain GEDCOM standard compliance
- Backup before modifications

**Example:**

```javascript
const fs = require('fs');
const { parse, stringify } = require('gedcom-parser');

class GedcomUpdater {
  constructor(gedcomPath) {
    this.gedcomPath = gedcomPath;
    this.data = parse(fs.readFileSync(gedcomPath, 'utf8'));
  }

  addIndividual(person) {
    // Generate new individual ID
    const newId = this.generateNextId();

    // Create GEDCOM individual record
    const individual = {
      id: newId,
      tag: 'INDI',
      data: [
        { tag: 'NAME', data: person.name },
        { tag: 'SEX', data: person.sex || 'U' },
        { tag: 'BIRT', data: [
          { tag: 'DATE', data: person.birthDate },
          { tag: 'PLAC', data: person.birthPlace }
        ]},
        { tag: 'DEAT', data: [
          { tag: 'DATE', data: person.deathDate },
          { tag: 'PLAC', data: person.deathPlace }
        ]},
        { tag: 'NOTE', data: `Imported from ${person.source} on ${new Date().toISOString()}` }
      ]
    };

    // Add to data structure
    this.data.individuals.push(individual);

    return newId;
  }

  linkParent(childId, parentId, relationship) {
    // Create or update family record
    // Implementation details...
  }

  save() {
    // Backup current file
    fs.copyFileSync(this.gedcomPath, `${this.gedcomPath}.backup`);

    // Write updated GEDCOM
    fs.writeFileSync(this.gedcomPath, stringify(this.data));
  }

  generateNextId() {
    const maxId = Math.max(...this.data.individuals.map(i =>
      parseInt(i.id.replace(/[@I]/g, ''))
    ));
    return `@I${maxId + 1}@`;
  }
}

module.exports = GedcomUpdater;
```

### External Source Integration

#### ESPL Genealogy (Watson Family)

**URL Pattern:** `https://www.espl-genealogy.org/mearscol/pagendxw/watson/*.htm`

**Scraping Strategy:**

1. **Robots.txt Check:** Respect robots.txt and rate limits
2. **HTML Parsing:** Use Cheerio to parse genealogy tables
3. **Parent Links:** Follow links to parent pages
4. **Data Extraction:**
   - Person name (heading or table)
   - Birth/death dates and locations
   - Parents (links)
   - Spouse(s)
   - Children

**Example Scraper:**

```javascript
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeESPLPerson(url) {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Powell Family Tree Research Tool' }
  });

  const $ = cheerio.load(response.data);

  // Extract person data (structure varies by site)
  const person = {
    name: $('h2').first().text().trim(),
    birthDate: extractDate($, 'born'),
    birthPlace: extractPlace($, 'born'),
    deathDate: extractDate($, 'died'),
    deathPlace: extractPlace($, 'died'),
    parents: extractParents($),
    spouse: extractSpouse($),
    children: extractChildren($),
    source: 'espl-genealogy.org',
    url: url
  };

  return person;
}

function extractDate($, keyword) {
  // Search for patterns like "b. 1845" or "born 1845"
  const text = $.text();
  const regex = new RegExp(`${keyword}[:\\s]*(\\d{4})`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

function extractParents($) {
  const parents = [];
  $('a:contains("father"), a:contains("mother"), a:contains("parent")').each((i, el) => {
    parents.push({
      name: $(el).text(),
      url: $(el).attr('href')
    });
  });
  return parents;
}
```

---

## Implementation Timeline

### Week 1: Foundation

- [ ] Add Kathy Barker user configuration
- [ ] Test Kathy Barker tree view
- [ ] Setup backend Express server
- [ ] Implement basic scraping for ESPL site

### Week 2: Matching Engine

- [ ] Build fuzzy matching algorithm
- [ ] Implement confidence scoring
- [ ] Create matching engine tests
- [ ] Build frontend dashboard UI

### Week 3: Integration & Testing

- [ ] Connect frontend to backend API
- [ ] Implement GEDCOM updater
- [ ] Test end-to-end workflow
- [ ] Add data validation and error handling
- [ ] User documentation

---

## Testing Strategy

### Unit Tests

- Fuzzy name matching accuracy
- Date matching with tolerance
- Confidence score calculation
- GEDCOM parsing and updating

### Integration Tests

- Scraper extracts correct data from test HTML
- Matching engine correctly identifies matches
- API endpoints return expected responses
- GEDCOM file updates correctly

### Manual Testing

1. Search for known person in external source
2. Verify match confidence is accurate
3. Approve match and verify GEDCOM update
4. Reload tree and verify new ancestor appears
5. Test with various name spellings and date formats

---

## Security & Privacy Considerations

### Web Scraping Ethics

- **Respect robots.txt** — Honor site crawling policies
- **Rate Limiting** — Max 1 request per 2 seconds to avoid overload
- **User Agent** — Identify as research tool, not bot
- **Caching** — Cache results to minimize repeat requests

### Data Validation

- **Manual Review** — Require user approval before importing
- **Confidence Threshold** — Only show matches >70% confidence
- **Backup GEDCOM** — Always backup before modifications
- **Undo Functionality** — Allow rollback of imports

### Privacy

- **No Auto-Upload** — Never upload user data to external servers
- **Local Processing** — Run matching engine locally when possible
- **Consent** — User explicitly approves each import

---

## Success Criteria

### Feature 1: Kathy Barker User

- ✅ Kathy Barker appears in user dropdown
- ✅ Her ancestry tree loads correctly
- ✅ All existing features work for her view
- ✅ No performance degradation

### Feature 2: Genealogy Integration

- ✅ Successfully scrapes ESPL genealogy site
- ✅ Matches 80%+ of known individuals correctly
- ✅ Discovers at least 5 new ancestors from external sources
- ✅ Imports data without corrupting GEDCOM file
- ✅ User can approve/reject matches
- ✅ Confidence scores are accurate and useful

---

## Future Enhancements (Phase 5+)

- **Multi-Source Integration** — FamilySearch, Ancestry, WikiTree
- **AI-Powered Matching** — Machine learning for better accuracy
- **Automatic Discovery** — Background search for all individuals
- **Conflict Resolution** — Handle conflicting data from multiple sources
- **Source Citations** — Track where each piece of data came from
- **Image Integration** — Download and attach photos from external sites

---

## File Structure

```
powell-tree/
├── server/                          # NEW - Backend server
│   ├── api.js                       # Express API routes
│   ├── genealogy-scraper.js         # Web scraping utilities
│   ├── matching-engine.js           # Fuzzy matching algorithms
│   ├── gedcom-updater.js            # GEDCOM file manipulation
│   └── package.json                 # Server dependencies
├── src/
│   ├── components/
│   │   └── GenealogyIntegration.jsx # NEW - Integration dashboard
│   ├── App.jsx                      # Updated with Kathy Barker
│   ├── AppReactFlow.jsx             # Updated with Kathy Barker
│   └── ...
├── docs/
│   └── PHASE4_SPEC.md               # This file
└── ...
```

---

## Dependencies

### Backend

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "gedcom-parser": "^1.0.0",
    "levenshtein": "^1.0.5",
    "cors": "^2.8.5"
  }
}
```

### Frontend

No new dependencies required (uses existing React/Tailwind stack)

---

## Risk Assessment

### High Risk

- **Web Scraping Reliability** — External sites may change structure
- **Data Accuracy** — Incorrect matches could corrupt family tree
- **Legal Issues** — Some sites prohibit scraping

**Mitigation:**

- Build robust HTML parsers with fallbacks
- Require manual approval for all imports
- Consult site terms of service, use public APIs where available

### Medium Risk

- **GEDCOM Corruption** — File updates could break existing data
- **Performance** — Large-scale scraping may be slow

**Mitigation:**

- Always backup GEDCOM before modifications
- Implement undo functionality
- Add progress indicators for long operations

### Low Risk

- **UI Complexity** — Dashboard may be overwhelming
- **User Adoption** — Users may not understand confidence scores

**Mitigation:**

- Provide clear documentation and tooltips
- Start with simple UI, iterate based on feedback

---

## Acceptance Criteria

### Phase 4 Complete When:

1. ✅ Kathy Barker user is functional and tested
2. ✅ Backend scraping service is operational
3. ✅ Matching engine achieves >80% accuracy on test dataset
4. ✅ Frontend dashboard allows searching, reviewing, and approving matches
5. ✅ GEDCOM updater successfully imports new ancestors
6. ✅ End-to-end workflow tested with real data
7. ✅ Documentation completed for users and developers
8. ✅ All tests passing

---

## Related Documentation

- [GEDCOM Standard](https://www.gedcom.org/gedcom.html)
- [ESPL Genealogy Collection](https://www.espl-genealogy.org/mearscol/)
- [Web Scraping Best Practices](https://www.scraperapi.com/blog/web-scraping-best-practices/)
