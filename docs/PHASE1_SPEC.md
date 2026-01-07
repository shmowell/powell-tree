# Phase 1: Navigation Enhancements - Feature Specification

## Overview

This specification defines the essential navigation features to be added to the Powell Family Tree application. These features address the core challenge of navigating a large dataset (4,915 individuals, 600+ ancestors per user) while maintaining the warm, personal aesthetic.

**Feature Branch:** `feature/phase1-navigation-enhancements`

**Target Completion:** Phase 1 of the project roadmap

---

## Problem Statement

Currently, users must manually expand and navigate the tree to find specific ancestors. With 600+ ancestors per user, this is time-consuming and disorienting. Users have no way to:

- Search for specific ancestors by name
- Understand their current location in the tree (breadcrumb trail)
- Limit the number of visible generations
- Quickly reset the view to fit screen

---

## Features to Implement

### 1. Search Bar with Name Matching

#### Description

A search input in the header that allows users to find ancestors by name and navigate directly to them in the tree.

#### Location

Header area, below the user selector, centered on the page.

#### Component Interface

```jsx
<SearchBar
  individuals={parsedIndividuals}  // Object: GEDCOM individuals data
  onSelectPerson={handlePersonSelect}  // Function: (personId: string) => void
/>
```

#### Behavior

1. **Search Input**
   - Placeholder text: "Search ancestors..."
   - Minimum 2 characters to trigger search
   - Case-insensitive matching
   - Searches first name, last name, and full name

2. **Results Dropdown**
   - Appears below search input when query length >= 2
   - Maximum 10 results displayed
   - Each result shows:
     - Full name (bold)
     - Birth year — Death year (or "Present" if living)
   - Hover state: light amber background
   - Click to select: navigates to person

3. **Navigation on Select**
   - Calculate path from root user to selected ancestor
   - Expand all nodes in that path
   - Optionally set selected person in detail panel
   - Clear search query
   - Close dropdown

4. **No Results State**
   - Show message: "No ancestors found matching '{query}'"
   - Display in same dropdown style

5. **Click Outside to Close**
   - Clicking anywhere outside the dropdown closes it

#### Styling

- Input: `w-80` width, rounded-full, amber focus ring
- Dropdown: rounded-2xl, shadow-xl, max-h-80 with scroll
- Search icon: 🔍 emoji on left side of input
- Consistent with existing white/90 opacity cards

#### Acceptance Criteria

- [ ] Search input renders in header below user selector
- [ ] Typing 2+ characters shows results dropdown
- [ ] Results match first name, last name, or full name (case-insensitive)
- [ ] Clicking result navigates to person and expands path
- [ ] Search clears after selection
- [ ] No results message shows when query has no matches
- [ ] Dropdown closes on click outside
- [ ] Works for all 4 users
- [ ] Mobile responsive (smaller width on mobile)

---

### 2. Breadcrumb Trail

#### Description

A breadcrumb navigation showing the ancestry path from the current user to any selected ancestor, allowing quick navigation up the tree.

#### Location

Below the header controls, above the tree canvas, centered.

#### Component Interface

```jsx
<Breadcrumbs
  path={ancestryPath}  // Array: [{id, name, photo}, ...]
  onNavigate={handleBreadcrumbClick}  // Function: (personId: string) => void
  rootName="You"  // String: Label for root person
/>
```

#### Behavior

1. **Path Display**
   - Shows: "You → Father → Grandfather → Great-Grandfather"
   - Arrows (→) separate each segment
   - Root person shows as "You"
   - Other ancestors show relationship label

2. **Relationship Labels**
   - Depth 1: "Father" or "Mother"
   - Depth 2: "Grandfather" or "Grandmother"
   - Depth 3: "Great-Grandfather" or "Great-Grandmother"
   - Depth 4+: "2nd Great-Grandfather", "3rd Great-Grandfather", etc.
   - Gender determined by photo emoji (👨/👴 = male, 👩/👵 = female)

3. **Path Calculation**
   - Recalculates when `selectedPerson` changes
   - Traverse tree from root to selected person
   - Store array of ancestors in order

4. **Navigation on Click**
   - Click any segment to navigate to that ancestor
   - Expand path to that person
   - Update selection

5. **Current Location Highlight**
   - Last segment in path (selected person) is bold and amber-700
   - Other segments are normal weight, stone-600

6. **Hide When Empty**
   - If no person selected or path is just root, don't render

#### Styling

- Container: rounded-full, white/80 background, border, shadow-sm
- Max width: 4xl
- Horizontal scrolling on overflow
- Hover: text-amber-600
- Current: font-semibold, text-amber-700

#### Acceptance Criteria

- [ ] Breadcrumbs render below header when person selected
- [ ] Path shows correct relationship labels
- [ ] Labels calculate correctly up to 10+ generations
- [ ] Clicking breadcrumb segment navigates to person
- [ ] Last segment is highlighted (bold, amber)
- [ ] Hides when no person selected
- [ ] Updates when selection changes
- [ ] Works for all 4 users
- [ ] Scrolls horizontally on small screens

---

### 3. Generation Depth Control

#### Description

A dropdown control that limits the maximum number of ancestor generations displayed in the tree.

#### Location

In the controls row, next to Expand All / Collapse buttons.

#### Component Interface

```jsx
<GenerationControl
  maxGenerations={maxGen}  // Number: 3-20
  setMaxGenerations={setMaxGen}  // Function: (num: number) => void
/>
```

#### Behavior

1. **Dropdown Options**
   - Values: 3, 4, 5, 6, 7, 8, 9, 10, 15, 20
   - Default: 5 generations
   - Label: "Show Generations: [dropdown]"

2. **Tree Limiting**
   - Modify `AncestryBranch` to accept `maxDepth` prop
   - Pass `depth` through recursive calls
   - When `depth >= maxDepth`, don't render parents
   - Hide expand button when at depth limit

3. **Expand All Integration**
   - "Expand All" respects generation limit
   - Only expands up to `maxGenerations` depth

4. **State Management**
   - Add `maxGenerations` state to App.jsx
   - Default to 5
   - Persist choice during session (not across reloads)

#### Styling

- Container: rounded-full, white/80, border, shadow-sm
- Dropdown: transparent background, no border, medium font-weight
- Consistent with existing control buttons

#### Acceptance Criteria

- [ ] Generation control renders in controls row
- [ ] Dropdown shows options 3-20
- [ ] Default is 5 generations
- [ ] Tree respects selected limit
- [ ] Expand button hidden at depth limit
- [ ] Expand All respects limit
- [ ] Changing limit updates tree immediately
- [ ] Works for all 4 users
- [ ] State persists during session

---

### 4. Fit to Screen Button

#### Description

A button that resets zoom to fit the currently visible tree within the viewport.

#### Location

In the controls row, next to zoom +/- controls.

#### Component Interface

Integrated into existing zoom control group:

```jsx
<button onClick={fitToScreen}>
  <span>⛶</span> Fit Screen
</button>
```

#### Behavior

1. **Fit to Screen Action**
   - Calculate bounding box of currently visible tree nodes
   - Calculate zoom level to fit within viewport
   - Set zoom to calculated level
   - Reset pan position to center tree

2. **Smart Zoom Calculation**
   - Use viewport dimensions
   - Account for header and control heights
   - Add padding (e.g., 10% margin)
   - Clamp between min (0.2) and max (1.5) zoom

3. **Button State**
   - Always enabled
   - Shows hover effect

#### Styling

- Similar to existing Expand All / Collapse buttons
- Icon: ⛶ (or ⊡ square with corners)
- Text: "Fit Screen"
- Rounded-full, white/80, border, shadow-sm

#### Acceptance Criteria

- [ ] Button renders in controls row
- [ ] Click calculates visible tree bounds
- [ ] Zoom adjusts to fit tree in viewport
- [ ] Pan resets to center
- [ ] Works with different tree sizes
- [ ] Works after expand/collapse operations
- [ ] Respects min/max zoom limits
- [ ] Works for all 4 users

---

## Technical Implementation Details

### State Changes in App.jsx

```jsx
// Add new state
const [maxGenerations, setMaxGenerations] = useState(5);
const [parsedData, setParsedData] = useState({ individuals: {}, families: {} });

// Save parsed data in loadGedcom
const { individuals, families } = parseGedcom(gedcomText);
setParsedData({ individuals, families });

// Add navigation function
const navigateToPerson = useCallback((personId) => {
  const path = findPathInTree(familyData, personId);
  if (path) {
    setExpandedNodes(new Set(path));
    setSelectedPerson(familyData); // or find person by id
  }
}, [familyData]);

// Add breadcrumb path calculation
const ancestryPath = useMemo(() => {
  if (!selectedPerson || !familyData) return [];
  return buildPathToSelected(familyData, selectedPerson.id);
}, [selectedPerson, familyData]);
```

### AncestryBranch Component Changes

```jsx
function AncestryBranch({
  node,
  onSelectPerson,
  selectedPerson,
  expandedNodes,
  toggleExpand,
  isRoot = false,
  depth = 0,          // ADD
  maxDepth = 20       // ADD
}) {
  const hasParents = (node.father || node.mother) && depth < maxDepth; // MODIFY
  // ...
  // Pass depth + 1 to child components
}
```

### Helper Functions to Add

```javascript
// Find path from root to target person
function findPathInTree(node, targetId, currentPath = []) {
  if (!node) return null;

  const newPath = [...currentPath, node.id];
  if (node.id === targetId) return newPath;

  const fatherPath = findPathInTree(node.father, targetId, newPath);
  if (fatherPath) return fatherPath;

  const motherPath = findPathInTree(node.mother, targetId, newPath);
  if (motherPath) return motherPath;

  return null;
}

// Build path with person details for breadcrumbs
function buildPathToSelected(root, targetId) {
  const idPath = findPathInTree(root, targetId);
  if (!idPath) return [];

  const detailPath = [];
  let currentNode = root;

  for (const id of idPath) {
    if (currentNode.id === id) {
      detailPath.push({
        id: currentNode.id,
        name: currentNode.name,
        photo: currentNode.photo
      });

      // Navigate to next node
      if (currentNode.father?.id === idPath[detailPath.length]) {
        currentNode = currentNode.father;
      } else if (currentNode.mother?.id === idPath[detailPath.length]) {
        currentNode = currentNode.mother;
      }
    }
  }

  return detailPath;
}
```

---

## File Structure Changes

```
src/
├── components/
│   ├── SearchBar.jsx          # NEW
│   ├── Breadcrumbs.jsx        # NEW
│   └── GenerationControl.jsx  # NEW
├── App.jsx                     # MODIFIED
└── gedcomParser.js            # NO CHANGES
```

---

## Testing Checklist

### Search Bar

- [ ] Renders correctly in header
- [ ] `/` keyboard shortcut works
- [ ] Search with 0-1 characters shows nothing
- [ ] Search with 2+ characters shows dropdown
- [ ] Results match case-insensitively
- [ ] Clicking result navigates correctly
- [ ] Path expands to selected person
- [ ] Search clears after selection
- [ ] No results message displays correctly
- [ ] Dropdown closes on outside click

### Breadcrumbs

- [ ] Renders below header when person selected
- [ ] Hides when no person selected
- [ ] Shows correct relationship labels for depth 1-10+
- [ ] Clicking segment navigates correctly
- [ ] Current segment highlighted
- [ ] Updates when selection changes
- [ ] Scrolls horizontally on small screens

### Generation Control

- [ ] Renders in controls row
- [ ] Shows options 3-20
- [ ] Default is 5
- [ ] Tree limits at selected depth
- [ ] Expand button hidden at limit
- [ ] Expand All respects limit
- [ ] Updates immediately on change

### Fit to Screen

- [ ] Button renders in controls
- [ ] Calculates bounds correctly
- [ ] Zooms to fit viewport
- [ ] Centers tree
- [ ] Works with various tree sizes

### Cross-Feature Integration

- [ ] Search + Breadcrumbs work together
- [ ] Generation limit affects search results navigation
- [ ] Fit to Screen works with generation limit
- [ ] All features work for all 4 users

### Browser Testing

- [ ] Chrome desktop
- [ ] Firefox desktop
- [ ] Safari desktop
- [ ] Chrome mobile
- [ ] Safari mobile

---

## Design Specifications

### Color Palette (Existing)

- Background: amber-50, yellow-50, orange-50 gradients
- Cards/Controls: white/80 or white/90
- Borders: stone-200, stone-300
- Text: stone-800 (primary), stone-600 (secondary), stone-500 (tertiary)
- Accents: amber-400, amber-500, amber-600, amber-700
- Focus: ring-2 ring-amber-400

### Component Styling Guidelines

- Rounded corners: rounded-full for buttons/inputs, rounded-2xl for dropdowns
- Shadows: shadow-sm for controls, shadow-lg or shadow-xl for dropdowns
- Transitions: transition-all or transition-colors
- Hover states: hover:bg-amber-50, hover:text-amber-600
- Focus states: focus:outline-none focus:ring-2 focus:ring-amber-400

---

## Success Criteria

Phase 1 is complete when:

1. All 4 features are implemented and functional
2. All acceptance criteria are met
3. All tests pass
4. Code follows existing patterns and style
5. Production build succeeds without errors
6. Features work for all 4 users (William Theodore, Kristen, Victoria, William Jordan)
7. Mobile responsive
8. No console errors or warnings
9. PR approved and merged to main
10. Deployed successfully to Railway

---

## Out of Scope (Phase 2+)

The following are NOT included in Phase 1:

- Minimap overview
- Fan chart view
- List/table view
- Timeline view
- Advanced search filters (date range, location)
- Fuzzy matching library (fuse.js)
- Relationship calculator
- Export features
- Print functionality

---

## Approval

**Specification Author:** Claude Code

**Requires Approval From:** Will Powell

**Status:** Awaiting Approval

Once approved, implementation will proceed according to this specification.
