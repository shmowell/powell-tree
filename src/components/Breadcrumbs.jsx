import React from 'react';

export function Breadcrumbs({ path, onNavigate, rootName }) {
  if (!path || path.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-stone-600 px-4 py-2
                    bg-white/80 rounded-full border border-stone-200 shadow-sm
                    max-w-4xl mx-auto overflow-x-auto">
      {path.map((person, index) => (
        <React.Fragment key={person.id}>
          {index > 0 && <span className="text-stone-400 flex-shrink-0">→</span>}
          <button
            onClick={() => onNavigate(person.id)}
            className={`hover:text-amber-600 transition-colors whitespace-nowrap ${
              index === path.length - 1 ? 'font-semibold text-amber-700' : ''
            }`}
            title={person.name}
          >
            {index === 0 ? rootName || 'You' : getRelationshipLabel(index, person)}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

function getRelationshipLabel(depth, person) {
  // Determine gender from photo emoji
  const isMale = person.photo === '👨' || person.photo === '👴';

  if (depth === 1) return isMale ? 'Father' : 'Mother';
  if (depth === 2) return isMale ? 'Grandfather' : 'Grandmother';

  // For depth 3+: Great-Grandfather, 2nd Great-Grandfather, etc.
  const greatsCount = depth - 2;
  if (greatsCount === 1) {
    return isMale ? 'Great-Grandfather' : 'Great-Grandmother';
  }

  const ordinal = getOrdinalSuffix(greatsCount - 1);
  return `${greatsCount - 1}${ordinal} Great-${isMale ? 'Grandfather' : 'Grandmother'}`;
}

function getOrdinalSuffix(n) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}
