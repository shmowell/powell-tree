/**
 * Genealogy Matching Engine
 *
 * Fuzzy matches individuals from GEDCOM data with external sources
 * using name, date, and location similarity.
 */

import { distance as levenshteinDistance } from 'levenshtein';

/**
 * Match a GEDCOM person with an external person record
 * @param {Object} gedcomPerson - Person from GEDCOM
 * @param {Object} externalPerson - Person from external source
 * @returns {Object} Match result with confidence score
 */
export function matchIndividual(gedcomPerson, externalPerson) {
  let confidence = 0;
  const scores = {};

  // Name matching (40% weight)
  scores.name = fuzzyMatchName(gedcomPerson.name, externalPerson.name);
  confidence += scores.name * 40;

  // Birth year matching (30% weight)
  scores.birth = dateMatch(gedcomPerson.birth, externalPerson.birthDate, 3);
  confidence += scores.birth * 30;

  // Death year matching (20% weight)
  scores.death = dateMatch(gedcomPerson.death, externalPerson.deathDate, 3);
  confidence += scores.death * 20;

  // Location matching (10% weight)
  scores.location = locationMatch(gedcomPerson.birthPlace, externalPerson.birthPlace);
  confidence += scores.location * 10;

  return {
    match: confidence > 70, // 70% threshold
    confidence: Math.round(confidence),
    scores: scores,
    gedcomPerson: {
      id: gedcomPerson.id,
      name: gedcomPerson.name,
      birth: gedcomPerson.birth,
      death: gedcomPerson.death,
      birthPlace: gedcomPerson.birthPlace
    },
    externalPerson: externalPerson,
    source: externalPerson.source
  };
}

/**
 * Fuzzy match two names using Levenshtein distance
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {number} Similarity score (0-1)
 */
function fuzzyMatchName(name1, name2) {
  if (!name1 || !name2) return 0;

  // Normalize names
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);

  // Calculate Levenshtein distance
  const dist = levenshteinDistance(n1, n2);
  const maxLen = Math.max(n1.length, n2.length);

  // Convert to similarity score (0-1)
  const similarity = 1 - (dist / maxLen);

  // Bonus for exact last name match
  const lastName1 = getLastName(name1);
  const lastName2 = getLastName(name2);

  if (lastName1 && lastName2 && lastName1 === lastName2) {
    return Math.min(1, similarity + 0.2); // +20% bonus
  }

  return similarity;
}

/**
 * Normalize name for comparison
 * @param {string} name - Name to normalize
 * @returns {string} Normalized name
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extract last name from full name
 * @param {string} fullName - Full name
 * @returns {string|null} Last name
 */
function getLastName(fullName) {
  const parts = fullName.trim().split(' ');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null;
}

/**
 * Match dates with tolerance
 * @param {string} date1 - First date (year)
 * @param {string} date2 - Second date (year)
 * @param {number} tolerance - Year tolerance
 * @returns {number} Similarity score (0-1)
 */
function dateMatch(date1, date2, tolerance = 3) {
  if (!date1 || !date2) return 0;

  // Extract years
  const year1 = extractYear(date1);
  const year2 = extractYear(date2);

  if (!year1 || !year2) return 0;

  const diff = Math.abs(year1 - year2);

  // Perfect match
  if (diff === 0) return 1;

  // Within tolerance
  if (diff <= tolerance) return 1 - (diff / (tolerance + 1));

  // Gradual falloff beyond tolerance
  return Math.max(0, 1 - (diff / 20));
}

/**
 * Extract year from date string
 * @param {string} dateStr - Date string
 * @returns {number|null} Year
 */
function extractYear(dateStr) {
  if (!dateStr) return null;

  // Look for 4-digit year
  const match = dateStr.match(/(\d{4})/);
  if (match) {
    const year = parseInt(match[1]);
    // Validate reasonable year range
    if (year >= 1000 && year <= 2100) {
      return year;
    }
  }

  return null;
}

/**
 * Match locations
 * @param {string} loc1 - First location
 * @param {string} loc2 - Second location
 * @returns {number} Similarity score (0-1)
 */
function locationMatch(loc1, loc2) {
  if (!loc1 || !loc2) return 0;

  const l1 = loc1.toLowerCase().trim();
  const l2 = loc2.toLowerCase().trim();

  // Exact match
  if (l1 === l2) return 1;

  // Contains match
  if (l1.includes(l2) || l2.includes(l1)) return 0.8;

  // Check for common location parts (city, state, country)
  const parts1 = l1.split(/[,\s]+/);
  const parts2 = l2.split(/[,\s]+/);

  let matches = 0;
  let total = Math.max(parts1.length, parts2.length);

  for (const part1 of parts1) {
    for (const part2 of parts2) {
      if (part1 === part2 && part1.length > 2) {
        matches++;
        break;
      }
    }
  }

  return total > 0 ? (matches / total) : 0;
}

/**
 * Batch match multiple individuals
 * @param {Array} gedcomPeople - Array of GEDCOM persons
 * @param {Array} externalPeople - Array of external persons
 * @returns {Array} Array of matches sorted by confidence
 */
export function batchMatch(gedcomPeople, externalPeople) {
  const matches = [];

  for (const gedcomPerson of gedcomPeople) {
    for (const externalPerson of externalPeople) {
      const result = matchIndividual(gedcomPerson, externalPerson);

      if (result.match) {
        matches.push(result);
      }
    }
  }

  // Sort by confidence (highest first)
  return matches.sort((a, b) => b.confidence - a.confidence);
}

export default {
  matchIndividual,
  batchMatch
};
