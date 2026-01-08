/**
 * GEDCOM Database Enrichment Script
 *
 * Automatically scrapes external genealogy sources for all individuals
 * in the GEDCOM file and adds discovered ancestors to the database.
 *
 * Usage: node enrich-database.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchESPL, followParentLinks } from './stealth-scraper.js';
import { matchIndividual } from './matching-engine.js';
import { addToGedcom, parseExistingIndividuals, readGedcom } from './gedcom-updater.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to GEDCOM file
const GEDCOM_PATH = path.join(__dirname, '..', 'public', 'family.ged');

// Configuration
const CONFIG = {
  minConfidenceScore: 70, // Only add matches above 70% confidence
  batchSize: 10, // Process 10 people at a time
  delayBetweenBatches: 10000, // 10 seconds between batches
  maxPeopleToProcess: process.argv.includes('--limit')
    ? parseInt(process.argv[process.argv.indexOf('--limit') + 1]) || 5
    : null, // null = process all, or set a number for testing
  dryRun: process.argv.includes('--dry-run'), // Don't actually modify GEDCOM
};

/**
 * Parse GEDCOM file to extract all individuals
 */
async function getAllIndividuals() {
  const gedcomContent = await readGedcom(GEDCOM_PATH);
  const individuals = [];
  const lines = gedcomContent.split('\n');

  let currentPerson = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Start of individual: 0 @I123@ INDI
    if (line.match(/^0 @(I\d+)@ INDI/)) {
      if (currentPerson) {
        individuals.push(currentPerson);
      }

      const match = line.match(/^0 @(I\d+)@ INDI/);
      currentPerson = {
        id: match[1],
        name: null,
        birth: null,
        death: null,
        birthPlace: null,
        deathPlace: null
      };
    }

    if (!currentPerson) continue;

    // Name: 1 NAME John /Doe/
    if (line.match(/^1 NAME (.+)/)) {
      const match = line.match(/^1 NAME (.+)/);
      currentPerson.name = match[1].replace(/\//g, '').trim();
    }

    // Birth date: 2 DATE 1850
    if (line.match(/^2 DATE (.+)/) && lines[i - 1]?.includes('BIRT')) {
      const match = line.match(/^2 DATE (.+)/);
      currentPerson.birth = match[1].trim();
    }

    // Birth place: 2 PLAC Scotland
    if (line.match(/^2 PLAC (.+)/) && lines[i - 1]?.includes('DATE') && lines[i - 2]?.includes('BIRT')) {
      const match = line.match(/^2 PLAC (.+)/);
      currentPerson.birthPlace = match[1].trim();
    }

    // Death date: 2 DATE 1920
    if (line.match(/^2 DATE (.+)/) && lines[i - 1]?.includes('DEAT')) {
      const match = line.match(/^2 DATE (.+)/);
      currentPerson.death = match[1].trim();
    }

    // Death place: 2 PLAC England
    if (line.match(/^2 PLAC (.+)/) && lines[i - 1]?.includes('DATE') && lines[i - 2]?.includes('DEAT')) {
      const match = line.match(/^2 PLAC (.+)/);
      currentPerson.deathPlace = match[1].trim();
    }
  }

  // Add last person
  if (currentPerson) {
    individuals.push(currentPerson);
  }

  return individuals.filter(p => p.name); // Only people with names
}

/**
 * Search for ancestors of a person
 */
async function findAncestors(person) {
  console.log(`\n🔍 Searching for ancestors of: ${person.name} (@${person.id}@)`);

  try {
    // Search external source
    const externalResults = await searchESPL(person.name);

    if (externalResults.length === 0) {
      console.log(`   No external results found`);
      return [];
    }

    console.log(`   Found ${externalResults.length} potential matches`);

    // Match against current person
    const matches = externalResults
      .map(ext => matchIndividual(person, ext))
      .filter(m => m.confidence >= CONFIG.minConfidenceScore)
      .sort((a, b) => b.confidence - a.confidence);

    if (matches.length === 0) {
      console.log(`   No high-confidence matches (>=${CONFIG.minConfidenceScore}%)`);
      return [];
    }

    console.log(`   ✅ ${matches.length} high-confidence matches`);

    // Extract new ancestors from matches
    const newAncestors = [];

    for (const match of matches) {
      const ext = match.externalPerson;

      // Add parents if found
      if (ext.parents && ext.parents.length > 0) {
        for (const parentName of ext.parents) {
          newAncestors.push({
            name: parentName,
            source: ext.source,
            url: ext.url,
            childName: person.name,
            childId: person.id
          });
        }
      }
    }

    return newAncestors;

  } catch (error) {
    console.error(`   ❌ Error searching for ${person.name}:`, error.message);
    return [];
  }
}

/**
 * Process a batch of people
 */
async function processBatch(people, batchNumber) {
  console.log(`\n📦 Processing batch ${batchNumber} (${people.length} people)`);

  const allNewAncestors = [];

  for (const person of people) {
    const ancestors = await findAncestors(person);
    allNewAncestors.push(...ancestors);
  }

  return allNewAncestors;
}

/**
 * Main enrichment process
 */
async function enrichDatabase() {
  console.log('🌳 GEDCOM Database Enrichment');
  console.log('═'.repeat(50));
  console.log(`📁 GEDCOM file: ${GEDCOM_PATH}`);
  console.log(`🎯 Min confidence: ${CONFIG.minConfidenceScore}%`);
  console.log(`📦 Batch size: ${CONFIG.batchSize}`);
  console.log('═'.repeat(50));

  try {
    // Read all individuals
    console.log('\n📖 Reading GEDCOM file...');
    const allIndividuals = await getAllIndividuals();
    console.log(`   Found ${allIndividuals.length} individuals in database`);

    // Limit if configured
    let peopleToProcess = allIndividuals;
    if (CONFIG.maxPeopleToProcess) {
      peopleToProcess = allIndividuals.slice(0, CONFIG.maxPeopleToProcess);
      console.log(`   ⚠️  Limited to first ${CONFIG.maxPeopleToProcess} for testing`);
    }

    // Split into batches
    const batches = [];
    for (let i = 0; i < peopleToProcess.length; i += CONFIG.batchSize) {
      batches.push(peopleToProcess.slice(i, i + CONFIG.batchSize));
    }

    console.log(`   📦 Split into ${batches.length} batches`);

    // Process batches
    const allDiscoveredAncestors = [];

    for (let i = 0; i < batches.length; i++) {
      const batchAncestors = await processBatch(batches[i], i + 1);
      allDiscoveredAncestors.push(...batchAncestors);

      // Delay between batches (except last batch)
      if (i < batches.length - 1) {
        console.log(`\n⏳ Waiting ${CONFIG.delayBetweenBatches / 1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('📊 ENRICHMENT SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Total people processed: ${peopleToProcess.length}`);
    console.log(`Total ancestors discovered: ${allDiscoveredAncestors.length}`);

    if (allDiscoveredAncestors.length === 0) {
      console.log('\n⚠️  No new ancestors found. Database not modified.');
      return;
    }

    // Remove duplicates by name
    const uniqueAncestors = [];
    const seenNames = new Set();

    for (const ancestor of allDiscoveredAncestors) {
      if (!seenNames.has(ancestor.name.toLowerCase())) {
        seenNames.add(ancestor.name.toLowerCase());
        uniqueAncestors.push(ancestor);
      }
    }

    console.log(`Unique new ancestors: ${uniqueAncestors.length}`);

    // Ask for confirmation
    console.log('\n❓ Add these ancestors to the database? (This will modify family.ged)');
    console.log('   Preview of first 5:');
    uniqueAncestors.slice(0, 5).forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.name} (parent of ${a.childName})`);
    });

    // Check for dry run
    if (CONFIG.dryRun) {
      console.log('\n🏃 DRY RUN MODE - Database will not be modified');
      console.log('   Remove --dry-run flag to actually update the database');
      return;
    }

    // Auto-proceed for now (in production, you'd want confirmation)
    console.log('\n✅ Proceeding with database update...');

    // Add to GEDCOM
    const result = await addToGedcom(GEDCOM_PATH, uniqueAncestors);

    console.log('\n' + '═'.repeat(50));
    console.log('✨ ENRICHMENT COMPLETE');
    console.log('═'.repeat(50));
    console.log(`✅ Added: ${result.addedIndividuals.length} individuals`);
    console.log(`⚠️  Skipped duplicates: ${result.skippedDuplicates.length}`);
    console.log(`📦 Backup: ${path.basename(result.backupPath)}`);
    console.log('\n🔄 Restart the frontend to see updated tree!');

  } catch (error) {
    console.error('\n❌ Enrichment failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  enrichDatabase();
}

export default enrichDatabase;
