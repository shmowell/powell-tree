/**
 * Powell Family Tree Server
 *
 * Backend server for genealogy integration features
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchESPL, followParentLinks } from './stealth-scraper.js';
import { matchIndividual, batchMatch } from './matching-engine.js';
import { addToGedcom } from './gedcom-updater.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/genealogy/search
 * Info page for search endpoint
 */
app.get('/api/genealogy/search', (req, res) => {
  res.json({
    error: 'This endpoint requires a POST request',
    usage: 'POST /api/genealogy/search',
    body: {
      person: {
        name: 'string (required)',
        birth: 'string (optional)',
        death: 'string (optional)',
        birthPlace: 'string (optional)'
      }
    },
    example: {
      person: {
        name: 'John Watson',
        birth: '1845',
        death: '1920',
        birthPlace: 'Scotland'
      }
    }
  });
});

/**
 * POST /api/genealogy/search
 * Search external sources for a person
 *
 * Body: { person: { name, birth, death, birthPlace } }
 * Returns: Array of potential matches with confidence scores
 */
app.post('/api/genealogy/search', async (req, res) => {
  try {
    const { person } = req.body;

    if (!person || !person.name) {
      return res.status(400).json({ error: 'Person name is required' });
    }

    console.log(`Searching for: ${person.name}`);

    // Search external sources
    const externalResults = await searchESPL(person.name);

    console.log(`Found ${externalResults.length} potential matches`);

    // Match against GEDCOM person
    const matches = externalResults
      .map(ext => matchIndividual(person, ext))
      .filter(m => m.confidence > 50) // Show matches >50% confidence
      .sort((a, b) => b.confidence - a.confidence);

    console.log(`${matches.length} matches above 50% confidence`);

    res.json(matches);

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/genealogy/discover
 * Discover ancestors by following parent links
 *
 * Body: { url: 'https://...' }
 * Returns: Array of discovered ancestors
 */
app.post('/api/genealogy/discover', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Discovering ancestors from: ${url}`);

    const ancestors = await followParentLinks(url);

    res.json({ ancestors });

  } catch (error) {
    console.error('Discovery error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Powell Family Tree Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/genealogy/search - Search for person matches',
      'POST /api/genealogy/discover - Discover ancestors',
      'GET /api/health - Health check'
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🌳 Powell Family Tree Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔍 Genealogy integration ready\n`);
});
