# Powell Family Tree - Claude Code Handover Document

## Project Overview

A React-based ancestry tree visualization web application for the Powell family. The app displays family ancestry data from a GEDCOM file, allowing 4 family members to explore their heritage.

**Live URL:** Deployed on Railway (connected to GitHub repo)
**Tech Stack:** React 18, Vite, Tailwind CSS, GEDCOM parser

---

## Current Architecture

### File Structure
```
family-tree-app/
├── public/
│   └── family.ged          # GEDCOM family data file
├── src/
│   ├── App.jsx             # Main application component
│   ├── gedcomParser.js     # GEDCOM file parser
│   ├── main.jsx            # React entry point
│   └── index.css           # Tailwind imports
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── railway.json            # Railway deployment config
```

### Key Components (in App.jsx)

1. **App** - Main component with state management
   - `currentUser` - Selected user key
   - `selectedPerson` - Person for detail panel
   - `expandedNodes` - Set of expanded node IDs
   - `zoom` - Current zoom level

2. **AncestryBranch** - Recursive tree renderer
   - Uses refs to measure DOM positions
   - Draws SVG bezier curves between nodes
   - Handles expand/collapse

3. **PersonCard** - Individual person display
   - Shows name, dates, emoji avatar
   - Expand button (▼) separate from card click
   - Visual indicators for deceased/living

4. **DetailPanel** - Slide-out info panel
   - Shows full person details
   - Click-outside to close

5. **PannableCanvas** - Pan/zoom container
   - Mouse drag to pan
   - Scroll wheel to zoom
   - Touch support

### Data Flow
```
family.ged (public folder)
    ↓
fetch() on mount
    ↓
parseGedcom() → { individuals, families }
    ↓
buildAncestryTree() for each user
    ↓
familyTrees state → render
```

### User Configuration
```javascript
const userConfig = {
  william_theodore: { name: 'William Theodore Powell', label: 'William Theodore Powell' },
  kristen: { name: 'Kristen Elizabeth Powell', label: 'Kristen Elizabeth Powell' },
  victoria: { name: 'Victoria Maria Powell', label: 'Victoria Maria Powell' },
  william_jordan: { name: 'William Jordan Powell', label: 'William Jordan Powell' },
};
```

---

## GEDCOM Parser (gedcomParser.js)

### Exported Functions

```javascript
// Parse raw GEDCOM text into structured data
parseGedcom(gedcomText) → { individuals, families }

// Build ancestry tree starting from a person
buildAncestryTree(personId, individuals, families, depth, maxDepth) → treeNode

// Find person by name (case-insensitive)
findPersonByName(name, individuals) → personId | null

// Get all individuals as array
getAllIndividuals(individuals) → [{id, name, birth, death}, ...]
```

### Tree Node Structure
```javascript
{
  id: "@I1@",           // GEDCOM ID
  name: "John Smith",
  birth: "1950",        // Year only
  death: "2020" | null,
  birthPlace: "City, State",
  deathPlace: "City, State",
  photo: "👨" | "👩" | "👴" | "👵",
  father: { ... } | undefined,
  mother: { ... } | undefined
}
```

---

## Styling System

### Color Palette (Tailwind)
- Background: amber-50, yellow-50, orange-50 gradients
- Cards: white/90, stone borders
- Accent: amber-400, amber-500, amber-600
- Text: stone-800 (primary), stone-500 (secondary)
- Connectors: stone-400 (#a8a29e)

### Key CSS Classes
- `.font-display` - For headings (defined in tailwind.config.js)
- Rounded corners: `rounded-2xl` for cards, `rounded-full` for buttons
- Shadows: `shadow-lg`, `shadow-amber-200/50`

---

## Deployment

### Railway Configuration
- Builds with `npm run build`
- Serves from `dist/` folder
- Auto-deploys on GitHub push

### To Update
1. Push changes to GitHub
2. Railway auto-deploys
3. Wait ~2 minutes for build

---

## Feature Requirements

### Priority 1: Search Functionality

**Requirements:**
- Search bar in header
- Search by first name, last name, or full name
- Fuzzy matching for spelling variations
- Results dropdown showing matches with birth year
- Click result to:
  1. Navigate to person in tree
  2. Expand path from root to person
  3. Center view on person

**Implementation Notes:**
- Add search state to App component
- Create SearchBar component
- Use `getAllIndividuals()` from parser
- Filter with case-insensitive includes or fuzzy library
- On select: calculate path, expand nodes, scroll into view

### Priority 2: Breadcrumb Trail

**Requirements:**
- Show ancestry path: "You → Father → Grandfather → ..."
- Display below header or above tree
- Clickable segments to navigate up
- Update when person is selected

**Implementation Notes:**
- Calculate path by traversing up from selected person
- Store path in state
- Render as horizontal list of clickable links
- On click: expand that branch, scroll to person

### Priority 3: Generation Control

**Requirements:**
- Slider or dropdown: "Show generations 1-N"
- Default to 3 generations
- Maximum ~10 generations
- "Expand All" respects limit

**Implementation Notes:**
- Add `maxGenerations` state
- Modify expand functions to respect limit
- Add UI control in header area

### Priority 4: Minimap

**Requirements:**
- Small overview in corner (bottom-left or top-right)
- Shows entire tree as dots/simplified view
- Rectangle indicates current viewport
- Click to navigate
- Drag rectangle to pan
- Toggle visibility

**Implementation Notes:**
- Render simplified version of tree at small scale
- Calculate viewport rectangle based on pan/zoom state
- Sync minimap interactions with main canvas
- Consider using React Flow's MiniMap as reference

### Priority 5: Relationship Labels

**Requirements:**
- Show relationship to root person on each card
- Format: "2nd Great-Grandfather", "Great-Grandmother", etc.
- Calculate automatically based on position in tree

**Implementation Notes:**
- Add generation depth to tree traversal
- Map depth to relationship term:
  - 0: You
  - 1: Father/Mother
  - 2: Grandfather/Grandmother
  - 3: Great-Grandfather/Great-Grandmother
  - 4+: 2nd Great-, 3rd Great-, etc.
- Pass as prop to PersonCard

### Priority 6: Alternative Views

**Fan Chart View:**
- Semicircle with user at center
- Concentric arcs for each generation
- Click segment to select person
- Good for seeing tree completeness

**List View:**
- Table with columns: Name, Relationship, Birth, Death, Location
- Sortable columns
- Filterable
- Click row to navigate in tree

**Implementation Notes:**
- Add view toggle in header
- Create separate components for each view
- Share selection state across views

---

## Technical Recommendations

### Performance Optimizations
1. **Virtualization** - Only render visible nodes
2. **Memoization** - useMemo for tree calculations
3. **Lazy Loading** - Load deep ancestors on demand
4. **Canvas Rendering** - Consider for 500+ visible nodes

### Libraries to Consider
```bash
# Fuzzy search
npm install fuse.js

# Better tree layouts
npm install d3-hierarchy

# Minimap / flow diagrams
npm install @xyflow/react

# Date handling
npm install date-fns
```

### State Management
Current: useState in App component
If complexity grows, consider:
- useReducer for related state
- Zustand for global state
- React Query for data fetching

---

## Testing Checklist

### Functional Tests
- [ ] All 4 users load correctly
- [ ] Tree expands/collapses properly
- [ ] Curves connect to correct positions
- [ ] Detail panel opens/closes
- [ ] Zoom in/out works
- [ ] Pan works (mouse and touch)
- [ ] User selector switches trees

### New Feature Tests
- [ ] Search finds all matching names
- [ ] Search handles edge cases (no results, special characters)
- [ ] Breadcrumbs update on selection
- [ ] Navigation from breadcrumb works
- [ ] Generation limit enforced
- [ ] Minimap reflects tree state
- [ ] Minimap navigation works

### Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Chrome Android

---

## Known Issues / Tech Debt

1. **SVG curves recalculate on every render** - Could be optimized
2. **No error boundary** - Add React error boundary
3. **No loading skeleton** - Show placeholder while parsing
4. **Accessibility** - Add ARIA labels, keyboard navigation
5. **No unit tests** - Add Jest/Vitest tests

---

## Contact / Resources

**GEDCOM Specification:** https://www.familysearch.org/developers/docs/gedcom/
**Tailwind Docs:** https://tailwindcss.com/docs
**React Flow (minimap reference):** https://reactflow.dev/

---

## Quick Start for Claude Code

1. Clone the repository
2. `npm install`
3. `npm run dev` - Start dev server
4. Edit `src/App.jsx` for main changes
5. Edit `src/gedcomParser.js` for data handling
6. `npm run build` - Test production build
7. Push to GitHub - Auto-deploys to Railway

**Priority Task:** Implement search functionality (Priority 1 above)

The search bar should be placed in the header area, below the title. Use the existing warm amber styling to match the design aesthetic.
