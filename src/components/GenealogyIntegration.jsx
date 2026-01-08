/**
 * Genealogy Integration Component
 *
 * Allows users to search external genealogy sources
 * and discover new ancestors.
 *
 * Phase 4.2 - External Genealogy Integration
 */

import React, { useState } from 'react';

const API_URL = 'http://localhost:3001/api/genealogy';

export function GenealogyIntegration({ individuals }) {
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!selectedPersonId) {
      setError('Please select a person to search');
      return;
    }

    const person = individuals[selectedPersonId];
    if (!person) {
      setError('Person not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ person })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const matches = await response.json();
      setSearchResults(matches);

    } catch (err) {
      console.error('Search error:', err);
      setError(`Search failed: ${err.message}. Make sure the server is running on port 3001.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border-2 border-heritage-border shadow-lg">
      <h2
        className="text-2xl font-bold mb-4 text-heritage-text"
        style={{ fontFamily: 'EB Garamond, Lora, Georgia, serif' }}
      >
        External Genealogy Integration
      </h2>

      <p className="text-sm text-stone-600 mb-6">
        Search external genealogy databases to find matches and discover new ancestors.
        <span className="block mt-1 text-xs text-heritage-burgundy">
          ⚠️ Note: Server must be running on port 3001. Run <code className="bg-stone-100 px-1 rounded">npm start</code> in the <code className="bg-stone-100 px-1 rounded">server/</code> directory.
        </span>
      </p>

      {/* Person Selector */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-stone-700">
          Select Person to Search
        </label>
        <div className="flex gap-3">
          <select
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border-2 border-heritage-border
                       focus:border-heritage-ivy focus:outline-none"
            style={{ fontFamily: 'EB Garamond, Lora, Georgia, serif' }}
          >
            <option value="">Choose a person...</option>
            {Object.entries(individuals || {}).map(([id, person]) => (
              <option key={id} value={id}>
                {person.name} ({person.birth || '?'} - {person.death || 'Present'})
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            disabled={loading || !selectedPersonId}
            className={`px-6 py-2 rounded-lg font-semibold transition-all
              ${loading || !selectedPersonId
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-heritage-ivy text-white hover:bg-heritage-ivy-light shadow-md hover:shadow-lg'
              }`}
            style={{ fontFamily: 'EB Garamond, Lora, Georgia, serif' }}
          >
            {loading ? 'Searching...' : 'Search External Sources'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results Table */}
      {searchResults.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-heritage-text"
              style={{ fontFamily: 'EB Garamond, Lora, Georgia, serif' }}>
            Potential Matches
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-heritage-cream border-b-2 border-heritage-border">
                  <th className="p-3 text-left font-semibold text-heritage-text">Name</th>
                  <th className="p-3 text-left font-semibold text-heritage-text">Birth</th>
                  <th className="p-3 text-left font-semibold text-heritage-text">Death</th>
                  <th className="p-3 text-left font-semibold text-heritage-text">Location</th>
                  <th className="p-3 text-left font-semibold text-heritage-text">Source</th>
                  <th className="p-3 text-left font-semibold text-heritage-text">Confidence</th>
                  <th className="p-3 text-left font-semibold text-heritage-text">Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: 'EB Garamond, Lora, Georgia, serif' }}>
                {searchResults.map((result, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-heritage-border hover:bg-heritage-cream/50 transition-colors"
                  >
                    <td className="p-3">{result.externalPerson.name}</td>
                    <td className="p-3">{result.externalPerson.birthDate || '-'}</td>
                    <td className="p-3">{result.externalPerson.deathDate || '-'}</td>
                    <td className="p-3 text-sm">{result.externalPerson.birthPlace || '-'}</td>
                    <td className="p-3 text-xs">
                      <a
                        href={result.externalPerson.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-heritage-ivy hover:text-heritage-ivy-light underline"
                      >
                        {result.source}
                      </a>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded font-semibold ${
                          result.confidence > 90
                            ? 'bg-green-100 text-green-800'
                            : result.confidence > 70
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {result.confidence}%
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        className="px-3 py-1 bg-heritage-ivy text-white rounded hover:bg-heritage-ivy-light
                                   text-sm font-semibold transition-colors"
                        onClick={() => alert('Import feature coming soon!')}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Match Details */}
          <div className="mt-4 p-4 bg-heritage-cream/30 rounded-lg">
            <h4 className="font-semibold text-sm text-heritage-text mb-2">
              Matching Scores Explanation:
            </h4>
            <ul className="text-xs text-stone-600 space-y-1">
              <li>• <strong>Name (40%):</strong> Levenshtein distance + last name bonus</li>
              <li>• <strong>Birth (30%):</strong> Year matching with ±3 year tolerance</li>
              <li>• <strong>Death (20%):</strong> Year matching with ±3 year tolerance</li>
              <li>• <strong>Location (10%):</strong> Place name similarity</li>
            </ul>
            <p className="text-xs text-stone-500 mt-2">
              Matches above 70% confidence are considered strong matches.
            </p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && searchResults.length === 0 && selectedPersonId && !error && (
        <div className="text-center py-8 text-stone-500">
          <p>Click "Search External Sources" to find matches for the selected person.</p>
        </div>
      )}
    </div>
  );
}
