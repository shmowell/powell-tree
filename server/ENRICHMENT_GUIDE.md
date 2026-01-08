# GEDCOM Database Enrichment Guide

## Overview

The automated enrichment system discovers new ancestors from external genealogy sources and adds them to your GEDCOM database (`public/family.ged`).

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Read GEDCOM (4,915 individuals)                         │
│    ↓                                                         │
│ 2. Process in batches (10 people per batch)                │
│    ↓                                                         │
│ 3. For each person:                                         │
│    • Search external genealogy sites (stealth scraping)    │
│    • Find potential matches                                 │
│    • Use fuzzy matching (name, dates, location)            │
│    • Extract parent names if confidence > 70%              │
│    ↓                                                         │
│ 4. Collect all discovered ancestors                        │
│    ↓                                                         │
│ 5. Remove duplicates (by name)                             │
│    ↓                                                         │
│ 6. Create backup (family.backup.TIMESTAMP.ged)             │
│    ↓                                                         │
│ 7. Add new individuals to GEDCOM                           │
│    ↓                                                         │
│ 8. Reload frontend to see updated tree                     │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Test Run (Recommended First)

Process just 5 people in dry-run mode (no database changes):

```bash
cd server
npm run enrich:test -- --dry-run
```

This will show you:
- How many external matches are found
- Confidence scores for matches
- What would be added to the database
- **Without actually modifying anything**

### 2. Small Real Run

Process 20 people and actually update the database:

```bash
cd server
node enrich-database.js --limit 20
```

Check the results:
- Backup file created: `public/family.backup.TIMESTAMP.ged`
- Updated file: `public/family.ged`
- Reload frontend to see new ancestors

### 3. Full Enrichment

Process all 4,915 people (will take hours):

```bash
cd server
npm run enrich
```

**Estimated time:**
- 4,915 people ÷ 10 per batch = ~492 batches
- 10 seconds per batch = ~82 minutes
- Plus scraping time per person (2-5s) = ~4-6 hours total

## Command Options

```bash
# Dry run (no changes)
node enrich-database.js --dry-run

# Limit to specific number of people
node enrich-database.js --limit 50

# Combine options
node enrich-database.js --limit 100 --dry-run
```

## Configuration

Edit `enrich-database.js` to customize:

```javascript
const CONFIG = {
  minConfidenceScore: 70,      // Only add matches above 70%
  batchSize: 10,               // People per batch
  delayBetweenBatches: 10000,  // 10 seconds between batches
  maxPeopleToProcess: null,    // null = all, or set number
  dryRun: false                // Set true to test without changes
};
```

## What Gets Added

For each discovered ancestor, the system adds:

```gedcom
0 @I4916@ INDI
1 NAME John Watson
1 BIRT
2 DATE 1845
2 PLAC Scotland
1 DEAT
2 DATE 1920
2 PLAC England
1 SOUR
2 TITL espl-genealogy.org
2 URL https://www.espl-genealogy.org/...
2 NOTE Added from external genealogy source
```

## Safety Features

### 1. Automatic Backups

Every run creates a timestamped backup:

```
public/family.backup.1704715200000.ged
```

Keep these backups! You can restore if needed:

```bash
cd public
cp family.backup.1704715200000.ged family.ged
```

### 2. Duplicate Detection

The system checks for duplicates by name:
- Case-insensitive matching
- Skips if name already exists
- Logs skipped duplicates

### 3. Confidence Filtering

Only adds matches with:
- **Name similarity**: Levenshtein distance
- **Birth year**: ±3 years tolerance
- **Death year**: ±3 years tolerance
- **Location**: Contains/partial matching
- **Overall confidence**: Must be ≥70%

### 4. Rate Limiting

Respects external sites:
- 2-5 second random delay between requests
- 10 second delay between batches
- User agent rotation
- Stealth browser headers

## Monitoring Progress

The script outputs detailed progress:

```
🌳 GEDCOM Database Enrichment
══════════════════════════════════════════════════
📁 GEDCOM file: .../public/family.ged
🎯 Min confidence: 70%
📦 Batch size: 10
══════════════════════════════════════════════════

📖 Reading GEDCOM file...
   Found 4915 individuals in database
   📦 Split into 492 batches

📦 Processing batch 1 (10 people)

🔍 Searching for ancestors of: William Theodore Powell (@I1@)
   Found 15 potential matches
   ✅ 3 high-confidence matches

... (continues) ...

═══════════════════════════════════════════════════
📊 ENRICHMENT SUMMARY
═══════════════════════════════════════════════════
Total people processed: 4915
Total ancestors discovered: 127
Unique new ancestors: 89

✅ Proceeding with database update...
💾 GEDCOM updated: .../public/family.ged
📦 Backup created: family.backup.1704715200000.ged

═══════════════════════════════════════════════════
✨ ENRICHMENT COMPLETE
═══════════════════════════════════════════════════
✅ Added: 89 individuals
⚠️  Skipped duplicates: 38
📦 Backup: family.backup.1704715200000.ged

🔄 Restart the frontend to see updated tree!
```

## Troubleshooting

### "Unable to scrape" errors

External sites may be blocking requests:
- The stealth scraper tries to bypass this
- Some sites may still return 403 errors
- Script continues with next person
- Check `STEALTH_GUIDE.md` for anti-detection techniques

### "No high-confidence matches"

This is normal! Many people may not have matches:
- External site may not have that family
- Name variations may not match well
- Dates may be too different
- Only high-confidence matches are added

### Script runs very slowly

This is intentional for rate limiting:
- 2-5 seconds between requests
- 10 seconds between batches
- Full enrichment of 4,915 people takes 4-6 hours
- Consider running overnight

### Frontend doesn't show new ancestors

After enrichment:
1. Stop the frontend dev server (Ctrl+C)
2. Restart: `npm run dev`
3. The GEDCOM parser will reload with new data

## Best Practices

1. **Start Small**: Test with `--limit 20` first
2. **Use Dry Run**: Always test with `--dry-run` first
3. **Keep Backups**: Don't delete backup files
4. **Run Off-Peak**: Large enrichments take hours
5. **Monitor Logs**: Watch for errors or blocked requests
6. **Respect Sites**: Don't run multiple instances in parallel

## Advanced Usage

### Custom External Sources

To add more genealogy sites, edit `stealth-scraper.js`:

```javascript
// Add new search function
export async function searchFamilySearch(name) {
  // Implementation
}

// Update enrich-database.js to use both sources
const externalResults = [
  ...await searchESPL(person.name),
  ...await searchFamilySearch(person.name)
];
```

### Adjusting Confidence Threshold

Lower threshold = more matches, but less accurate:

```javascript
const CONFIG = {
  minConfidenceScore: 60,  // Lower from 70 to 60
  // ...
};
```

Higher threshold = fewer matches, but more accurate:

```javascript
const CONFIG = {
  minConfidenceScore: 85,  // Raise from 70 to 85
  // ...
};
```

### Family Link Creation

Currently adds individuals only. To link them as families, see `gedcom-updater.js`:

```javascript
// Create family record
const familyId = getNextFamilyId(gedcomContent);
const familyRecord = createFamilyRecord(
  familyId,
  parentId1,
  parentId2,
  [childId]
);
```

## Support

For issues:
1. Check server logs for detailed errors
2. Review `STEALTH_GUIDE.md` for scraping issues
3. Inspect backup files if database corrupted
4. Create GitHub issue with error logs

## Example Session

```bash
# Navigate to server directory
cd server

# Install dependencies (first time only)
npm install

# Test with 5 people, dry run
npm run enrich:test -- --dry-run

# Output:
# 🌳 GEDCOM Database Enrichment
# Found 4915 individuals in database
# ⚠️  Limited to first 5 for testing
# ...
# 🏃 DRY RUN MODE - Database will not be modified

# Looks good! Try with 10 people for real
node enrich-database.js --limit 10

# Output:
# ...
# ✅ Added: 3 individuals
# ⚠️  Skipped duplicates: 2
# 📦 Backup: family.backup.1704715200000.ged
# 🔄 Restart the frontend to see updated tree!

# Check the backup was created
ls ../public/family.backup.*

# Restart frontend to see new ancestors
cd ..
npm run dev
```

Happy genealogy research! 🌳
