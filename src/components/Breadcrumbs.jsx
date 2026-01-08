import React from 'react';

export function Breadcrumbs({ path, onNavigate, rootName }) {
  if (!path || path.length === 0) return null;

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Gradient fade indicators for scroll on mobile */}
      {path.length > 3 && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-50/90 to-transparent pointer-events-none z-10 md:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-amber-50/90 to-transparent pointer-events-none z-10 md:hidden" />
        </>
      )}

      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-stone-600 px-3 sm:px-4 py-2
                      bg-white/80 rounded-full border border-stone-200 shadow-sm
                      overflow-x-auto scrollbar-hide">
        {path.map((person, index) => (
          <React.Fragment key={person.id}>
            {index > 0 && (
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-stone-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            <button
              onClick={() => onNavigate(person.id)}
              className={`
                hover:text-amber-600 active:text-amber-700 active:bg-amber-50
                transition-colors whitespace-nowrap
                px-2 py-1 rounded-full
                min-h-[36px] sm:min-h-0
                flex items-center
                ${index === path.length - 1 ? 'font-semibold text-amber-700 bg-amber-50/50' : ''}
              `}
              title={person.name}
            >
              {index === 0 ? rootName || 'You' : getRelationshipLabel(index, person)}
            </button>
          </React.Fragment>
        ))}
      </nav>
    </div>
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
