# Phase 2: Orientation Features - Feature Specification

## Overview

Phase 2 builds on the Phase 1 navigation enhancements to add orientation and context features that help users understand where they are in the family tree and explore relationships more intuitively.

**Status:** Ready to implement
**Prerequisites:** Phase 1 must be completed and deployed
**Estimated Complexity:** Medium

---

## Phase 1 Completion Status

### ✅ Completed Features (Phase 1)

1. **SearchBar Component** - Find ancestors by name with dropdown results
2. **Breadcrumbs Component** - Ancestry path with relationship labels
3. **GenerationControl** - Limit visible generations (3-20, default 5)
4. **Fit to Screen Button** - Reset zoom to 0.8
5. **Compact Navbar** - All controls condensed into ~10% vertical space
6. **Helper Functions** - Navigation utilities (`findPathInTree`, `navigateToPerson`, `buildPathToSelected`)

### 📂 Current File Structure

```
src/
├── components/
│   ├── SearchBar.jsx
│   ├── Breadcrumbs.jsx
│   └── GenerationControl.jsx
├── App.jsx (with Phase 1 state & functions)
└── gedcomParser.js
```

---

## Phase 2 Feature Priorities

### Priority Features

1. **Minimap Overview** (Essential)
2. **Enhanced Relationship Labels** (Helpful)

### Optional Enhancements

3. **Ancestor Statistics Panel** (Nice-to-have)
4. **Keyboard Navigation** (Accessibility)

---

## Feature 1: Minimap Overview

### Description

A small overview map in the corner showing the entire visible tree with a viewport indicator showing which portion is currently visible.

### Location

Fixed position: Bottom-left corner (above help text)

### Component Interface

```jsx
<Minimap
  familyData={familyData}       // Full tree data
  expandedNodes={expandedNodes} // Set of expanded node IDs
  viewportBounds={bounds}       // {x, y, width, height} of visible area
  onNavigate={handleMinimapClick} // Navigate to clicked area
  maxDepth={maxGenerations}     // Respect generation limit
/>
```

### Behavior

1. **Minimap Rendering**
   - Fixed 200x150px canvas in bottom-left
   - Simplified tree representation (small dots for people)
   - Different colors:
     - Root person: Amber (larger dot)
     - Expanded ancestors: Stone-600
     - Collapsed ancestors: Stone-300
     - Viewport rectangle: Amber border with white/20 fill

2. **Viewport Indicator**
   - Shows current pan/zoom viewport as overlay rectangle
   - Updates in real-time as user pans/zooms
   - Gives context of where user is in large tree

3. **Interactive Navigation**
   - Click anywhere on minimap to center viewport there
   - Drag viewport rectangle to pan main view
   - Optional: Scroll on minimap to zoom

4. **Visibility**
   - Always visible (unless explicitly hidden)
   - Fade slightly when not hovering
   - Full opacity on hover

### Styling

```jsx
className="fixed bottom-20 left-4 w-48 h-36 bg-white/90 rounded-xl
           border border-stone-200 shadow-lg backdrop-blur-sm z-30
           hover:shadow-xl transition-all"
```

### Technical Implementation

```jsx
// Calculate minimap scale
const minimapScale = useMemo(() => {
  if (!familyData) return 1;

  const treeWidth = calculateTreeWidth(familyData);
  const treeHeight = calculateTreeHeight(familyData);

  return Math.min(200 / treeWidth, 150 / treeHeight);
}, [familyData, expandedNodes]);

// Render simplified tree nodes
const renderMinimapNodes = (node, x, y, depth = 0) => {
  if (depth >= maxDepth) return null;

  const isExpanded = expandedNodes.has(node.id);
  const nodeColor = depth === 0 ? '#f59e0b' :
                    isExpanded ? '#57534e' : '#d6d3d1';

  // Draw dot at scaled position
  ctx.fillStyle = nodeColor;
  ctx.beginPath();
  ctx.arc(x * minimapScale, y * minimapScale, 2, 0, Math.PI * 2);
  ctx.fill();

  // Recursively render parents if expanded
  if (isExpanded) {
    if (node.father) renderMinimapNodes(node.father, x - 50, y - 80, depth + 1);
    if (node.mother) renderMinimapNodes(node.mother, x + 50, y - 80, depth + 1);
  }
};
```

### Acceptance Criteria

- [ ] Minimap renders in bottom-left corner
- [ ] Shows simplified tree structure with dots
- [ ] Viewport rectangle shows current view area
- [ ] Clicking minimap pans main view to that location
- [ ] Updates in real-time with expand/collapse
- [ ] Respects maxGenerations limit
- [ ] Mobile: Optional hide or smaller size
- [ ] Performance: Renders smoothly even with 600+ nodes

---

## Feature 2: Enhanced Relationship Labels

### Description

Show relationship labels (e.g., "Father", "Great-Grandfather") directly on the tree connections, not just in breadcrumbs.

### Location

On the bezier curve connections between parent and child nodes.

### Component Changes

Update `AncestryBranch` component to render labels on curves.

### Behavior

1. **Label Positioning**
   - Place text label at midpoint of each bezier curve
   - Rotate to follow curve angle (optional)
   - Background: white/90 with padding for readability

2. **Label Content**
   - Same logic as Breadcrumbs: "Father", "Grandfather", "Great-Grandfather", etc.
   - Abbreviated on small screens: "F", "GF", "GGF", etc.
   - Optional: Show generation number: "Gen 3"

3. **Visibility Control**
   - Only show when zoomed in past certain threshold (e.g., zoom > 0.6)
   - Fade in/out smoothly based on zoom level
   - Optional: Toggle in settings

### Styling

```jsx
<text
  x={midX}
  y={midY}
  className="text-xs fill-stone-600 font-medium"
  textAnchor="middle"
  style={{
    paintOrder: 'stroke',
    stroke: 'white',
    strokeWidth: 3,
    strokeLinejoin: 'round'
  }}
>
  {relationshipLabel}
</text>
```

### Technical Implementation

```jsx
// In AncestryBranch component, add to SVG curves
const getRelationshipLabel = (depth, person) => {
  const isMale = person.photo === '👨' || person.photo === '👴';

  if (depth === 1) return isMale ? 'Father' : 'Mother';
  if (depth === 2) return isMale ? 'Grandfather' : 'Grandmother';

  const greatsCount = depth - 2;
  if (greatsCount === 1) {
    return isMale ? 'Great-Grandfather' : 'Great-Grandmother';
  }

  return `${greatsCount - 1}${getOrdinal(greatsCount - 1)} Great-${isMale ? 'Grandfather' : 'Grandmother'}`;
};

// Add to curve SVG
{isExpanded && (
  <g>
    {/* Existing curve path */}
    <path d={curvePath} ... />

    {/* New relationship label */}
    {zoom > 0.6 && (
      <text x={midX} y={midY - 5} ...>
        {getRelationshipLabel(depth, node)}
      </text>
    )}
  </g>
)}
```

### Acceptance Criteria

- [ ] Labels appear on curves when zoom > 0.6
- [ ] Shows correct relationship text
- [ ] Readable with white stroke outline
- [ ] Positioned at curve midpoint
- [ ] Doesn't overlap with person cards
- [ ] Fades in/out smoothly with zoom changes
- [ ] Optional: Abbreviates on mobile
- [ ] Works for all 4 users

---

## Feature 3: Ancestor Statistics Panel (Optional)

### Description

A collapsible panel showing statistics about the current user's ancestry.

### Location

Fixed position: Top-right corner (collapsible)

### Component Interface

```jsx
<StatsPanel
  familyData={familyData}
  expandedNodes={expandedNodes}
  isOpen={statsOpen}
  onToggle={() => setStatsOpen(!statsOpen)}
/>
```

### Statistics to Show

1. **Total Ancestors Found**: Count of all individuals in tree
2. **Generations Traced**: Deepest depth in current tree
3. **Expanded Ancestors**: Count of currently expanded nodes
4. **Common Surnames**: Top 5 surnames with counts
5. **Birth Year Range**: Earliest to latest birth year
6. **Most Distant Ancestor**: Name and generation count

### Behavior

- Initially collapsed (just an icon button)
- Click to expand panel
- Auto-collapse after 10 seconds of no interaction
- Recalculates when tree changes

### Acceptance Criteria

- [ ] Panel toggles open/closed
- [ ] Shows accurate statistics
- [ ] Updates when tree expands/collapses
- [ ] Mobile friendly (smaller, different position)
- [ ] Performance: Calculations memoized

---

## Feature 4: Keyboard Navigation (Optional)

### Description

Allow keyboard shortcuts for common actions.

### Keyboard Shortcuts

- `Escape` - Close detail panel
- `+` / `=` - Zoom in
- `-` / `_` - Zoom out
- `0` - Fit to screen (reset zoom)
- `f` - Focus on selected person
- `e` - Expand all
- `c` - Collapse all
- `?` - Show keyboard shortcuts help

### Implementation

```jsx
useEffect(() => {
  const handleKeyPress = (e) => {
    // Don't trigger if typing in search box
    if (e.target.tagName === 'INPUT') return;

    switch(e.key) {
      case 'Escape':
        setSelectedPerson(null);
        break;
      case '+':
      case '=':
        setZoom(z => Math.min(1.5, z + 0.1));
        break;
      case '-':
      case '_':
        setZoom(z => Math.max(0.2, z - 0.1));
        break;
      case '0':
        setZoom(0.8);
        break;
      case 'e':
        expandAll();
        break;
      case 'c':
        collapseAll();
        break;
      case '?':
        setShowKeyboardHelp(true);
        break;
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### Acceptance Criteria

- [ ] All shortcuts work as expected
- [ ] Doesn't interfere with search input typing
- [ ] Help modal shows all shortcuts
- [ ] Mobile: Shortcuts disabled (no keyboard)

---

## Implementation Plan

### Recommended Order

1. **Enhanced Relationship Labels** (Easiest - modify existing component)
2. **Minimap Overview** (Medium - new component, most valuable)
3. **Keyboard Navigation** (Easy - event handlers)
4. **Ancestor Statistics Panel** (Medium - new component, calculations)

### File Structure After Phase 2

```
src/
├── components/
│   ├── SearchBar.jsx
│   ├── Breadcrumbs.jsx
│   ├── GenerationControl.jsx
│   ├── Minimap.jsx              # NEW
│   ├── StatsPanel.jsx           # NEW (optional)
│   └── KeyboardHelp.jsx         # NEW (optional)
├── App.jsx
└── gedcomParser.js
```

---

## Testing Checklist

### Minimap

- [ ] Renders correctly for all 4 users
- [ ] Viewport indicator moves with pan/zoom
- [ ] Click navigation works
- [ ] Updates with expand/collapse
- [ ] Performance good with 600+ nodes
- [ ] Mobile responsive

### Relationship Labels

- [ ] Shows correct labels for each depth
- [ ] Readable at all zoom levels
- [ ] Fades appropriately
- [ ] No overlap with cards
- [ ] Works for all 4 users

### Keyboard Navigation

- [ ] All shortcuts functional
- [ ] Doesn't break search input
- [ ] Help modal accurate
- [ ] Desktop only

### Cross-browser

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Success Criteria

Phase 2 is complete when:

1. **Essential features implemented:**
   - [ ] Minimap or Enhanced Relationship Labels (at least one)

2. **Testing complete:**
   - [ ] All 4 users tested
   - [ ] Mobile responsive
   - [ ] No console errors
   - [ ] Production build succeeds

3. **Deployed:**
   - [ ] Merged to staging
   - [ ] Full QA passed
   - [ ] Merged to production
   - [ ] Verified on live site

---

## Notes for Next Session

- Phase 1 is complete and working well
- Compact navbar successful - reduced from 33% to 10% vertical space
- All Phase 1 state and helper functions are in place and can be reused
- Consider user feedback on Phase 1 before starting Phase 2
- Minimap would provide most value for large tree navigation
- Relationship labels enhance understanding without adding UI clutter

---

## Future Phases (Phase 3+)

Potential future enhancements:

- **Alternative Views**: List view, fan chart, timeline
- **Advanced Search**: Filters, date ranges, locations
- **Print/Export**: PDF, PNG, shareable links
- **Annotations**: Add notes, photos, stories
- **Relationship Calculator**: "How am I related to X?"
- **DNA Integration**: Import DNA match data
