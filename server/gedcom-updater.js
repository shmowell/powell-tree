/**
 * GEDCOM File Updater
 *
 * Adds new individuals and families discovered from external sources
 * to the existing GEDCOM file.
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Read existing GEDCOM file
 * @param {string} gedcomPath - Path to GEDCOM file
 * @returns {Promise<string>} GEDCOM content
 */
export async function readGedcom(gedcomPath) {
  try {
    return await fs.readFile(gedcomPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read GEDCOM: ${error.message}`);
  }
}

/**
 * Parse GEDCOM to extract existing individuals
 * @param {string} gedcomContent - GEDCOM file content
 * @returns {Object} Map of individual IDs and metadata
 */
export function parseExistingIndividuals(gedcomContent) {
  const individuals = new Map();
  const lines = gedcomContent.split('\n');

  let currentId = null;
  let currentName = null;

  for (const line of lines) {
    // Individual record start: 0 @I123@ INDI
    if (line.match(/^0 @(I\d+)@ INDI/)) {
      const match = line.match(/^0 @(I\d+)@ INDI/);
      currentId = match[1];
    }

    // Name: 1 NAME John /Doe/
    if (line.match(/^1 NAME (.+)/) && currentId) {
      const match = line.match(/^1 NAME (.+)/);
      currentName = match[1].replace(/\//g, '').trim();
      individuals.set(currentId, { id: currentId, name: currentName });
      currentId = null;
    }
  }

  return individuals;
}

/**
 * Get next available individual ID
 * @param {string} gedcomContent - GEDCOM file content
 * @returns {string} Next ID (e.g., "I4916")
 */
export function getNextIndividualId(gedcomContent) {
  const ids = [];
  const lines = gedcomContent.split('\n');

  for (const line of lines) {
    const match = line.match(/^0 @I(\d+)@ INDI/);
    if (match) {
      ids.push(parseInt(match[1]));
    }
  }

  const maxId = Math.max(...ids, 0);
  return `I${maxId + 1}`;
}

/**
 * Get next available family ID
 * @param {string} gedcomContent - GEDCOM file content
 * @returns {string} Next ID (e.g., "F123")
 */
export function getNextFamilyId(gedcomContent) {
  const ids = [];
  const lines = gedcomContent.split('\n');

  for (const line of lines) {
    const match = line.match(/^0 @F(\d+)@ FAM/);
    if (match) {
      ids.push(parseInt(match[1]));
    }
  }

  const maxId = Math.max(...ids, 0);
  return `F${maxId + 1}`;
}

/**
 * Create GEDCOM individual record
 * @param {string} id - Individual ID (e.g., "I4916")
 * @param {Object} person - Person data
 * @returns {string} GEDCOM record
 */
export function createIndividualRecord(id, person) {
  let record = `0 @${id}@ INDI\n`;
  record += `1 NAME ${person.name}\n`;

  if (person.birthDate || person.birthPlace) {
    record += `1 BIRT\n`;
    if (person.birthDate) record += `2 DATE ${person.birthDate}\n`;
    if (person.birthPlace) record += `2 PLAC ${person.birthPlace}\n`;
  }

  if (person.deathDate || person.deathPlace) {
    record += `1 DEAT\n`;
    if (person.deathDate) record += `2 DATE ${person.deathDate}\n`;
    if (person.deathPlace) record += `2 PLAC ${person.deathPlace}\n`;
  }

  if (person.source) {
    record += `1 SOUR\n`;
    record += `2 TITL ${person.source}\n`;
    if (person.url) record += `2 URL ${person.url}\n`;
    record += `2 NOTE Added from external genealogy source\n`;
  }

  return record;
}

/**
 * Create GEDCOM family record
 * @param {string} familyId - Family ID (e.g., "F123")
 * @param {string} husbandId - Husband individual ID
 * @param {string} wifeId - Wife individual ID
 * @param {Array<string>} childIds - Array of child IDs
 * @returns {string} GEDCOM record
 */
export function createFamilyRecord(familyId, husbandId = null, wifeId = null, childIds = []) {
  let record = `0 @${familyId}@ FAM\n`;

  if (husbandId) record += `1 HUSB @${husbandId}@\n`;
  if (wifeId) record += `1 WIFE @${wifeId}@\n`;

  for (const childId of childIds) {
    record += `1 CHIL @${childId}@\n`;
  }

  return record;
}

/**
 * Link individual to family as child
 * @param {string} gedcomContent - Current GEDCOM content
 * @param {string} individualId - Individual to link
 * @param {string} familyId - Family to link to
 * @returns {string} Updated GEDCOM content
 */
export function linkIndividualToFamily(gedcomContent, individualId, familyId) {
  const lines = gedcomContent.split('\n');
  const updatedLines = [];
  let inTargetIndividual = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if we're entering the target individual
    if (line === `0 @${individualId}@ INDI`) {
      inTargetIndividual = true;
      updatedLines.push(line);
      continue;
    }

    // Check if we're leaving the current individual
    if (inTargetIndividual && line.startsWith('0 ')) {
      // Insert FAMC before next record
      updatedLines.push(`1 FAMC @${familyId}@`);
      inTargetIndividual = false;
    }

    updatedLines.push(line);
  }

  return updatedLines.join('\n');
}

/**
 * Add new individuals and families to GEDCOM
 * @param {string} gedcomPath - Path to GEDCOM file
 * @param {Array<Object>} newIndividuals - Array of new person records
 * @param {Array<Object>} newFamilies - Array of new family records
 * @returns {Promise<Object>} Result with added IDs
 */
export async function addToGedcom(gedcomPath, newIndividuals = [], newFamilies = []) {
  try {
    // Read existing GEDCOM
    let gedcomContent = await readGedcom(gedcomPath);

    // Parse existing individuals to avoid duplicates
    const existingIndividuals = parseExistingIndividuals(gedcomContent);

    const addedIndividuals = [];
    const addedFamilies = [];
    const skippedDuplicates = [];

    // Find insertion point (before TRLR record)
    const trlrIndex = gedcomContent.lastIndexOf('0 TRLR');
    if (trlrIndex === -1) {
      throw new Error('Invalid GEDCOM: Missing TRLR record');
    }

    const beforeTrlr = gedcomContent.substring(0, trlrIndex);
    const afterTrlr = gedcomContent.substring(trlrIndex);

    let newRecords = '';

    // Add new individuals
    for (const person of newIndividuals) {
      // Check for duplicates by name
      const isDuplicate = Array.from(existingIndividuals.values()).some(
        existing => existing.name.toLowerCase() === person.name.toLowerCase()
      );

      if (isDuplicate) {
        skippedDuplicates.push(person.name);
        console.log(`⚠️  Skipping duplicate: ${person.name}`);
        continue;
      }

      const newId = getNextIndividualId(beforeTrlr + newRecords);
      const record = createIndividualRecord(newId, person);
      newRecords += record;

      addedIndividuals.push({ id: newId, name: person.name });
      console.log(`✅ Added individual: ${person.name} (@${newId}@)`);
    }

    // Add new families
    for (const family of newFamilies) {
      const newFamilyId = getNextFamilyId(beforeTrlr + newRecords);
      const record = createFamilyRecord(
        newFamilyId,
        family.husbandId,
        family.wifeId,
        family.childIds || []
      );
      newRecords += record;

      addedFamilies.push({ id: newFamilyId });
      console.log(`✅ Added family: @${newFamilyId}@`);
    }

    // Combine and write back
    const updatedGedcom = beforeTrlr + newRecords + afterTrlr;

    // Create backup
    const backupPath = gedcomPath.replace('.ged', `.backup.${Date.now()}.ged`);
    await fs.writeFile(backupPath, gedcomContent, 'utf-8');
    console.log(`📦 Backup created: ${path.basename(backupPath)}`);

    // Write updated GEDCOM
    await fs.writeFile(gedcomPath, updatedGedcom, 'utf-8');
    console.log(`💾 GEDCOM updated: ${gedcomPath}`);

    return {
      success: true,
      addedIndividuals,
      addedFamilies,
      skippedDuplicates,
      backupPath
    };

  } catch (error) {
    throw new Error(`Failed to update GEDCOM: ${error.message}`);
  }
}

export default {
  readGedcom,
  parseExistingIndividuals,
  getNextIndividualId,
  getNextFamilyId,
  createIndividualRecord,
  createFamilyRecord,
  linkIndividualToFamily,
  addToGedcom
};
