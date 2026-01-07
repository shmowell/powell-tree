import React, { useState, useMemo, useRef, useEffect } from 'react';

export function SearchBar({ individuals, onSelectPerson }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter individuals based on query with case-insensitive matching
  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    return Object.entries(individuals)
      .filter(([id, person]) =>
        person.name.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10)
      .map(([id, person]) => ({
        id,
        name: person.name,
        birth: person.birth,
        death: person.death
      }));
  }, [query, individuals]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (person) => {
    onSelectPerson(person.id);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search ancestors..."
          className="px-3 py-1.5 pl-8 w-64 bg-white rounded-full border border-stone-300
                     text-sm text-stone-700 placeholder-stone-400 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                     transition-all"
        />
        <span className="absolute left-2.5 text-stone-400 text-sm pointer-events-none">🔍</span>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl
                        border border-stone-200 max-h-80 overflow-y-auto z-50">
          {results.map((person) => (
            <button
              key={person.id}
              onClick={() => handleSelect(person)}
              className="w-full px-4 py-3 text-left hover:bg-amber-50
                         border-b border-stone-100 last:border-0 transition-colors
                         first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="font-medium text-stone-800">{person.name}</div>
              <div className="text-xs text-stone-500 mt-0.5">
                {person.birth}{person.death ? ` — ${person.death}` : ' — Present'}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl
                        border border-stone-200 p-4 text-center text-stone-500 z-50">
          No ancestors found matching &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
