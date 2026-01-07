# Powell Family Tree - Technical Implementation Guide

## Search Feature Implementation

### Component: SearchBar

```jsx
// src/components/SearchBar.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';

export function SearchBar({ individuals, onSelectPerson }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter individuals based on query
  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const searchTerm = query.toLowerCase();
    return Object.entries(individuals)
      .filter(([id, person]) => 
        person.name.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10) // Limit results
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
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search ancestors..."
          className="px-4 py-2 w-64 bg-white/90 rounded-full border border-stone-300 
                     text-stone-700 placeholder-stone-400 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <span className="absolute right-3 text-stone-400">🔍</span>
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg 
                        border border-stone-200 max-h-64 overflow-y-auto z-50">
          {results.map((person) => (
            <button
              key={person.id}
              onClick={() => handleSelect(person)}
              className="w-full px-4 py-2 text-left hover:bg-amber-50 
                         border-b border-stone-100 last:border-0"
            >
              <div className="font-medium text-stone-800">{person.name}</div>
              <div className="text-xs text-stone-500">
                {person.birth}{person.death ? ` — ${person.death}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg 
                        border border-stone-200 p-4 text-center text-stone-500 z-50">
          No ancestors found
        </div>
      )}
    </div>
  );
}
```

### Integration in App.jsx

```jsx
// Add to imports
import { SearchBar } from './components/SearchBar';

// Add state for parsed individuals
const [parsedData, setParsedData] = useState({ individuals: {}, families: {} });

// In the loadGedcom function, save parsed data:
const { individuals, families } = parseGedcom(gedcomText);
setParsedData({ individuals, families });

// Add function to navigate to person
const navigateToPerson = useCallback((personId) => {
  // Find the path from root to this person
  const findPath = (node, targetId, path = []) => {
    if (!node) return null;
    const newPath = [...path, node.id];
    if (node.id === targetId) return newPath;
    
    const fatherPath = findPath(node.father, targetId, newPath);
    if (fatherPath) return fatherPath;
    
    const motherPath = findPath(node.mother, targetId, newPath);
    if (motherPath) return motherPath;
    
    return null;
  };
  
  const path = findPath(familyData, personId);
  if (path) {
    // Expand all nodes in path
    setExpandedNodes(new Set(path));
    // Could also scroll to the node or set it as selected
  }
}, [familyData]);

// In header, add SearchBar:
<SearchBar 
  individuals={parsedData.individuals} 
  onSelectPerson={navigateToPerson} 
/>
```

---

## Breadcrumb Implementation

### Component: Breadcrumbs

```jsx
// src/components/Breadcrumbs.jsx
import React from 'react';

export function Breadcrumbs({ path, onNavigate }) {
  if (!path || path.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-stone-600 px-4 py-2 
                    bg-white/60 rounded-full border border-stone-200 shadow-sm">
      {path.map((person, index) => (
        <React.Fragment key={person.id}>
          {index > 0 && <span className="text-stone-400">→</span>}
          <button
            onClick={() => onNavigate(person.id)}
            className={`hover:text-amber-600 transition-colors ${
              index === path.length - 1 ? 'font-semibold text-amber-700' : ''
            }`}
          >
            {index === 0 ? 'You' : getRelationshipLabel(index, person)}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

function getRelationshipLabel(depth, person) {
  const isMale = person.photo === '👨' || person.photo === '👴';
  
  if (depth === 1) return isMale ? 'Father' : 'Mother';
  if (depth === 2) return isMale ? 'Grandfather' : 'Grandmother';
  if (depth === 3) return isMale ? 'Great-Grandfather' : 'Great-Grandmother';
  
  const greatCount = depth - 2;
  const ordinal = greatCount === 1 ? '' : `${greatCount - 1}${getOrdinalSuffix(greatCount - 1)} `;
  return `${ordinal}Great-${isMale ? 'Grandfather' : 'Grandmother'}`;
}

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
```

### Building the Path

```jsx
// In App.jsx, add function to build path to selected person
const buildPathToSelected = useCallback((selectedId) => {
  if (!selectedId || !familyData) return [];
  
  const findPath = (node, targetId, currentPath = []) => {
    if (!node) return null;
    
    const newPath = [...currentPath, {
      id: node.id,
      name: node.name,
      photo: node.photo
    }];
    
    if (node.id === targetId) return newPath;
    
    // Search in father's branch
    if (node.father) {
      const fatherPath = findPath(node.father, targetId, newPath);
      if (fatherPath) return fatherPath;
    }
    
    // Search in mother's branch
    if (node.mother) {
      const motherPath = findPath(node.mother, targetId, newPath);
      if (motherPath) return motherPath;
    }
    
    return null;
  };
  
  return findPath(familyData, selectedId) || [];
}, [familyData]);

// Compute path when selection changes
const selectedPath = useMemo(() => 
  buildPathToSelected(selectedPerson?.id),
  [selectedPerson?.id, buildPathToSelected]
);
```

---

## Generation Depth Control

```jsx
// Component: GenerationControl
function GenerationControl({ maxGen, setMaxGen }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-full 
                    border border-stone-200 shadow-sm">
      <span className="text-sm text-stone-600">Generations:</span>
      <select
        value={maxGen}
        onChange={(e) => setMaxGen(Number(e.target.value))}
        className="bg-transparent border-none text-stone-700 font-medium 
                   focus:outline-none cursor-pointer"
      >
        {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}

// Modify AncestryBranch to respect maxGen
function AncestryBranch({ node, depth = 0, maxDepth = 10, ...props }) {
  const hasParents = (node.father || node.mother) && depth < maxDepth;
  // ... rest of component
}
```

---

## Minimap Implementation

```jsx
// src/components/Minimap.jsx
import React, { useMemo } from 'react';

export function Minimap({ 
  tree, 
  expandedNodes, 
  viewportBounds, 
  treeBounds,
  onNavigate 
}) {
  const MINIMAP_WIDTH = 200;
  const MINIMAP_HEIGHT = 150;
  
  // Calculate scale to fit tree in minimap
  const scale = useMemo(() => {
    if (!treeBounds) return 1;
    const scaleX = MINIMAP_WIDTH / treeBounds.width;
    const scaleY = MINIMAP_HEIGHT / treeBounds.height;
    return Math.min(scaleX, scaleY, 1);
  }, [treeBounds]);
  
  // Render simplified tree nodes
  const renderMiniNodes = (node, x = MINIMAP_WIDTH / 2, y = 10, depth = 0) => {
    if (!node || depth > 8) return null;
    
    const isExpanded = expandedNodes.has(node.id);
    const nodeSize = 6;
    const verticalGap = 15;
    const horizontalSpread = 40 / (depth + 1);
    
    return (
      <g key={node.id}>
        <circle
          cx={x}
          cy={y}
          r={nodeSize / 2}
          fill={depth === 0 ? '#f59e0b' : '#d4a574'}
          stroke="#a8a29e"
          strokeWidth="1"
        />
        {isExpanded && node.father && (
          <>
            <line
              x1={x} y1={y + nodeSize / 2}
              x2={x - horizontalSpread} y2={y + verticalGap - nodeSize / 2}
              stroke="#a8a29e"
              strokeWidth="1"
            />
            {renderMiniNodes(node.father, x - horizontalSpread, y + verticalGap, depth + 1)}
          </>
        )}
        {isExpanded && node.mother && (
          <>
            <line
              x1={x} y1={y + nodeSize / 2}
              x2={x + horizontalSpread} y2={y + verticalGap - nodeSize / 2}
              stroke="#a8a29e"
              strokeWidth="1"
            />
            {renderMiniNodes(node.mother, x + horizontalSpread, y + verticalGap, depth + 1)}
          </>
        )}
      </g>
    );
  };
  
  // Viewport rectangle
  const viewportRect = useMemo(() => {
    if (!viewportBounds || !treeBounds) return null;
    return {
      x: ((viewportBounds.x - treeBounds.x) / treeBounds.width) * MINIMAP_WIDTH,
      y: ((viewportBounds.y - treeBounds.y) / treeBounds.height) * MINIMAP_HEIGHT,
      width: (viewportBounds.width / treeBounds.width) * MINIMAP_WIDTH,
      height: (viewportBounds.height / treeBounds.height) * MINIMAP_HEIGHT,
    };
  }, [viewportBounds, treeBounds]);
  
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert to tree coordinates
    const treeX = (clickX / MINIMAP_WIDTH) * treeBounds.width + treeBounds.x;
    const treeY = (clickY / MINIMAP_HEIGHT) * treeBounds.height + treeBounds.y;
    
    onNavigate({ x: treeX, y: treeY });
  };
  
  return (
    <div className="fixed bottom-20 left-4 z-40">
      <div className="bg-white/95 rounded-lg shadow-lg border border-stone-200 p-2">
        <svg 
          width={MINIMAP_WIDTH} 
          height={MINIMAP_HEIGHT}
          onClick={handleClick}
          className="cursor-pointer"
        >
          <rect 
            width={MINIMAP_WIDTH} 
            height={MINIMAP_HEIGHT} 
            fill="#fefce8" 
          />
          {renderMiniNodes(tree)}
          {viewportRect && (
            <rect
              x={viewportRect.x}
              y={viewportRect.y}
              width={viewportRect.width}
              height={viewportRect.height}
              fill="rgba(251, 191, 36, 0.2)"
              stroke="#f59e0b"
              strokeWidth="2"
            />
          )}
        </svg>
        <div className="text-xs text-stone-500 text-center mt-1">
          Click to navigate
        </div>
      </div>
    </div>
  );
}
```

---

## Fan Chart Implementation (Alternative View)

```jsx
// src/components/FanChart.jsx
import React from 'react';

export function FanChart({ tree, onSelectPerson, selectedId }) {
  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height - 50;
  
  const maxGenerations = 6;
  const startAngle = -90; // degrees
  const endAngle = 90;
  const innerRadius = 50;
  const radiusStep = 45;
  
  // Build flat list of ancestors with generation info
  const flattenTree = (node, gen = 0, angle = 0, arcSize = 180) => {
    if (!node || gen >= maxGenerations) return [];
    
    const result = [{
      ...node,
      generation: gen,
      angle,
      arcSize
    }];
    
    const childArcSize = arcSize / 2;
    
    if (node.father) {
      result.push(...flattenTree(node.father, gen + 1, angle - childArcSize / 2, childArcSize));
    }
    if (node.mother) {
      result.push(...flattenTree(node.mother, gen + 1, angle + childArcSize / 2, childArcSize));
    }
    
    return result;
  };
  
  const ancestors = flattenTree(tree);
  
  // Convert polar to cartesian
  const polarToCartesian = (radius, angleDeg) => {
    const angleRad = (angleDeg - 90) * Math.PI / 180;
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad)
    };
  };
  
  // Draw arc path
  const describeArc = (innerR, outerR, startA, endA) => {
    const start1 = polarToCartesian(innerR, startA);
    const end1 = polarToCartesian(innerR, endA);
    const start2 = polarToCartesian(outerR, startA);
    const end2 = polarToCartesian(outerR, endA);
    
    const largeArc = endA - startA > 180 ? 1 : 0;
    
    return [
      'M', start1.x, start1.y,
      'A', innerR, innerR, 0, largeArc, 1, end1.x, end1.y,
      'L', end2.x, end2.y,
      'A', outerR, outerR, 0, largeArc, 0, start2.x, start2.y,
      'Z'
    ].join(' ');
  };
  
  return (
    <div className="flex justify-center p-4">
      <svg width={width} height={height}>
        {ancestors.map((person) => {
          const innerR = innerRadius + person.generation * radiusStep;
          const outerR = innerR + radiusStep - 2;
          const startA = person.angle - person.arcSize / 2;
          const endA = person.angle + person.arcSize / 2;
          
          const isSelected = person.id === selectedId;
          const isRoot = person.generation === 0;
          
          return (
            <g key={person.id}>
              <path
                d={describeArc(innerR, outerR, startA, endA)}
                fill={isRoot ? '#fbbf24' : isSelected ? '#fcd34d' : '#fef3c7'}
                stroke="#a8a29e"
                strokeWidth="1"
                onClick={() => onSelectPerson(person)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
              {person.arcSize > 15 && (
                <text
                  x={polarToCartesian((innerR + outerR) / 2, person.angle).x}
                  y={polarToCartesian((innerR + outerR) / 2, person.angle).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.min(10, person.arcSize / 3)}
                  fill="#44403c"
                  transform={`rotate(${person.angle}, 
                    ${polarToCartesian((innerR + outerR) / 2, person.angle).x}, 
                    ${polarToCartesian((innerR + outerR) / 2, person.angle).y})`}
                >
                  {person.name.split(' ')[0]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

---

## List View Implementation

```jsx
// src/components/ListView.jsx
import React, { useState, useMemo } from 'react';

export function ListView({ individuals, currentUserId, onSelectPerson }) {
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState('');
  
  // Convert to array and calculate relationships
  const ancestorList = useMemo(() => {
    return Object.entries(individuals)
      .map(([id, person]) => ({
        id,
        name: person.name,
        birth: person.birth || '',
        death: person.death || '',
        birthPlace: person.birthPlace || ''
      }))
      .filter(p => 
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.birthPlace.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => {
        let aVal = a[sortField] || '';
        let bVal = b[sortField] || '';
        if (sortDir === 'desc') [aVal, bVal] = [bVal, aVal];
        return aVal.localeCompare(bVal);
      });
  }, [individuals, sortField, sortDir, filter]);
  
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };
  
  const SortHeader = ({ field, children }) => (
    <th 
      onClick={() => toggleSort(field)}
      className="px-4 py-2 text-left cursor-pointer hover:bg-amber-100 transition-colors"
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );
  
  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name or location..."
          className="px-4 py-2 w-64 rounded-lg border border-stone-300 
                     focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full">
          <thead className="bg-amber-50">
            <tr>
              <SortHeader field="name">Name</SortHeader>
              <SortHeader field="birth">Birth</SortHeader>
              <SortHeader field="death">Death</SortHeader>
              <SortHeader field="birthPlace">Location</SortHeader>
            </tr>
          </thead>
          <tbody>
            {ancestorList.map((person) => (
              <tr 
                key={person.id}
                onClick={() => onSelectPerson(person)}
                className="hover:bg-amber-50 cursor-pointer border-t border-stone-100"
              >
                <td className="px-4 py-2 font-medium">{person.name}</td>
                <td className="px-4 py-2 text-stone-600">{person.birth}</td>
                <td className="px-4 py-2 text-stone-600">{person.death || '—'}</td>
                <td className="px-4 py-2 text-stone-500 text-sm">{person.birthPlace || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-2 text-sm text-stone-500">
        Showing {ancestorList.length} ancestors
      </div>
    </div>
  );
}
```

---

## Keyboard Navigation

```jsx
// Add to App.jsx
useEffect(() => {
  const handleKeyDown = (e) => {
    // '/' to focus search
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      document.querySelector('[data-search-input]')?.focus();
    }
    
    // Escape to close panels
    if (e.key === 'Escape') {
      setSelectedPerson(null);
    }
    
    // +/- for zoom
    if (e.key === '+' || e.key === '=') {
      setZoom(z => Math.min(1.5, z + 0.1));
    }
    if (e.key === '-') {
      setZoom(z => Math.max(0.2, z - 0.1));
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## Performance Notes

### Virtualization Strategy
For trees with 500+ visible nodes:

```jsx
// Only render nodes within viewport + buffer
const isNodeVisible = (nodePosition, viewport, buffer = 200) => {
  return (
    nodePosition.x > viewport.left - buffer &&
    nodePosition.x < viewport.right + buffer &&
    nodePosition.y > viewport.top - buffer &&
    nodePosition.y < viewport.bottom + buffer
  );
};
```

### Memoization
```jsx
// Memoize expensive tree calculations
const familyData = useMemo(() => 
  familyTrees?.[currentUser], 
  [familyTrees, currentUser]
);

const expandedSet = useMemo(() => 
  new Set(expandedNodes), 
  [expandedNodes]
);
```

---

## Testing Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Type check (if using TypeScript)
npx tsc --noEmit
```
