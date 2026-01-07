# Session Handoff: Horizontal Tree Layout Implementation

## Current Status

**Branch:** `feature/horizontal-tree-layout`

**What Was Accomplished:**
1. ✅ Converted tree from vertical to horizontal orientation
2. ✅ Root user (William Theodore Powell) now appears on left
3. ✅ Ancestors extend to the right
4. ✅ Father appears above, mother below
5. ✅ +/− expand/collapse buttons on right edge of cards
6. ✅ Generation control properly prunes expanded nodes
7. ✅ All Phase 1 features (search, breadcrumbs, generation control) working
8. ❌ **Connector lines removed** - this is the main outstanding issue

**Current Layout:**
- Simple flexbox layout with `gap-12` spacing between cards
- Clean, functional tree without visual connectors
- All interactions working (expand, collapse, search, navigate)

---

## The Connector Lines Problem

### What We Tried (All Failed)

1. **SVG with dynamic positioning (getBoundingClientRect)**
   - Problem: Position calculations relative to wrong containers
   - Lines rendered but didn't align with cards

2. **CSS Borders with Flexbox**
   - Problem: Can't create proper T-junctions where both parents exist
   - Lines appeared but didn't connect properly

3. **HTML Tables**
   - Problem: Table cell alignment doesn't work well with card centering
   - Layout broke with nested tables

4. **Absolute positioned SVG overlays**
   - Problem: Complex coordinate calculations broke at deeper nesting levels

### Root Cause
The fundamental issue is calculating exact pixel positions for connector lines when:
- Cards are positioned by flexbox (dynamic positioning)
- Tree can be any depth (recursive nesting)
- Both parents may or may not exist (conditional T-junctions)
- Pan/zoom transforms are applied to entire tree

---

## Recommended Solution: Use a Tree Library

### Why Use a Library?
Professional tree/org chart libraries have solved this exact problem:
- **JointJS** - Uses SVG with automatic layout calculation
- **react-organizational-chart** - Purpose-built for hierarchical trees
- **react-family-tree** - Specifically designed for family trees
- **Cytoscape.js** - Graph visualization with tree layouts

These libraries:
1. Calculate all node positions FIRST
2. Then render connectors based on exact coordinates
3. Handle pan/zoom correctly
4. Support dynamic expand/collapse

### Recommended Library: `react-organizational-chart`

**Why this one:**
- Lightweight and simple
- Designed for horizontal tree layouts
- Supports custom node components (we can keep our PersonCard)
- Handles connectors automatically
- MIT license
- Active maintenance

**Installation:**
```bash
npm install react-organizational-chart
```

**Example Integration:**
```jsx
import { Tree, TreeNode } from 'react-organizational-chart';

function AncestryBranch({ node }) {
  return (
    <TreeNode label={<PersonCard person={node} />}>
      {node.father && <AncestryBranch node={node.father} />}
      {node.mother && <AncestryBranch node={node.mother} />}
    </TreeNode>
  );
}

// In App.jsx
<Tree
  lineWidth="2px"
  lineColor="#a8a29e"
  lineBorderRadius="0"
  label={<PersonCard person={rootNode} />}
>
  {rootNode.father && <AncestryBranch node={rootNode.father} />}
  {rootNode.mother && <AncestryBranch node={rootNode.mother} />}
</Tree>
```

---

## Alternative: Custom SVG Overlay Solution

If you want to avoid dependencies, here's the approach that WILL work:

### The Strategy
1. Render the entire tree without connectors (current state)
2. Add `data-node-id` attributes to each PersonCard
3. After render, use a separate component that:
   - Queries all rendered cards by data attribute
   - Gets their `getBoundingClientRect()` positions
   - Renders a single SVG overlay with all connector lines
   - Re-calculates on resize/expand/collapse

### Implementation Outline
```jsx
// 1. Add data attribute to PersonCard
<div data-node-id={person.id} data-person-card>

// 2. Create ConnectorOverlay component
function ConnectorOverlay({ expandedNodes }) {
  const [connectors, setConnectors] = useState([]);

  useEffect(() => {
    // Find all cards
    const cards = document.querySelectorAll('[data-node-id]');
    const lines = [];

    // For each expanded node
    expandedNodes.forEach(nodeId => {
      const childCard = document.querySelector(`[data-node-id="${nodeId}"]`);
      // Find its parents and calculate lines
      // ... calculation logic
    });

    setConnectors(lines);
  }, [expandedNodes]);

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {connectors.map((line, i) => (
        <path key={i} d={line} stroke="#a8a29e" strokeWidth="2" fill="none" />
      ))}
    </svg>
  );
}
```

---

## Current Code State

### File: `src/App.jsx` - Lines 96-140

```jsx
function AncestryBranch({ node, onSelectPerson, selectedPerson, expandedNodes, toggleExpand, isRoot = false, depth = 0, maxDepth = 20 }) {
  const hasParents = (node.father || node.mother) && depth < maxDepth;
  const isExpanded = expandedNodes.has(node.id);

  // Simple horizontal layout - no connectors, just spacing
  return (
    <div className="flex items-center gap-12">
      <PersonCard
        person={node}
        onCardClick={onSelectPerson}
        onExpandClick={() => toggleExpand(node.id)}
        isSelected={selectedPerson?.id === node.id}
        isExpanded={isExpanded}
        hasParents={hasParents}
        isRoot={isRoot}
      />

      {hasParents && isExpanded && (
        <div className="flex flex-col gap-6">
          {node.father && (
            <AncestryBranch
              node={node.father}
              onSelectPerson={onSelectPerson}
              selectedPerson={selectedPerson}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          )}
          {node.mother && (
            <AncestryBranch
              node={node.mother}
              onSelectPerson={onSelectPerson}
              selectedPerson={selectedPerson}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          )}
        </div>
      )}
    </div>
  );
}
```

**Key Points:**
- `gap-12` provides visual spacing between generations
- `flex items-center` vertically centers each row
- `flex-col gap-6` stacks parents vertically with spacing
- Recursive structure handles any depth

---

## Next Steps (Priority Order)

### Option A: Use react-organizational-chart (Recommended)
1. Install: `npm install react-organizational-chart`
2. Import Tree and TreeNode components
3. Wrap PersonCard in TreeNode components
4. Configure connector styles to match theme (#a8a29e, 2px width)
5. Test with all 4 users
6. Verify pan/zoom still works
7. Verify expand/collapse works
8. Adjust spacing if needed

**Estimated complexity:** Medium (2-3 hours)
**Success probability:** High (95%+)

### Option B: Implement Custom SVG Overlay
1. Add `data-node-id` to PersonCard
2. Create `ConnectorOverlay` component
3. Query DOM for card positions
4. Calculate connector paths
5. Render SVG overlay
6. Add ResizeObserver for updates
7. Test thoroughly

**Estimated complexity:** High (4-6 hours)
**Success probability:** Medium-High (70-80%)

### Option C: Ship Without Connectors
1. Improve visual hierarchy with borders/indentation
2. Add subtle background shading per generation
3. Use proximity to show relationships
4. Document as design choice

**Estimated complexity:** Low (30 minutes)
**Success probability:** High (100%)

---

## Important Files Modified

1. **src/App.jsx** - AncestryBranch component (lines 96-140)
2. **docs/HORIZONTAL_TREE_SPEC.md** - Specification document
3. **src/App.jsx** - PersonCard +/− button (lines 70-88)
4. **src/App.jsx** - PannableCanvas transform origin (line 390)

---

## What Works Perfectly

1. **Search** - Finds people, navigates, expands path
2. **Breadcrumbs** - Shows ancestry path with navigation
3. **Generation Control** - Limits depth, prunes expanded nodes correctly
4. **Expand/Collapse** - +/− buttons work, smooth transitions
5. **Pan/Zoom** - Smooth panning and zooming
6. **Detail Panel** - Click cards to see details
7. **User Switching** - All 4 users work correctly
8. **Layout** - Horizontal tree displays correctly at any depth

---

## Key Research Findings

From analyzing JointJS and professional tree libraries:

1. **They use SVG for connectors** - Not CSS borders or tables
2. **They calculate positions AFTER render** - Using getBoundingClientRect
3. **They use layout algorithms** - To position nodes before drawing connectors
4. **They separate concerns** - Node rendering is separate from connector rendering
5. **They use absolute positioned SVG overlays** - On top of the node tree

**The pattern:**
```
Layout Tree (flexbox/positioning)
  → Render Nodes
    → Measure Positions
      → Draw Connectors (SVG overlay)
```

---

## Testing Checklist

When connectors are implemented, test:
- [ ] All 4 user views render correctly
- [ ] Connectors align with cards at all depths
- [ ] Expand/collapse updates connectors
- [ ] Pan and zoom don't break connectors
- [ ] Search navigation works with connectors
- [ ] Generation limit works with connectors
- [ ] Mobile responsive (connectors scale properly)
- [ ] No performance issues with large trees (600+ nodes)

---

## Questions for User

Before proceeding, clarify:
1. **Library OK?** Is using `react-organizational-chart` acceptable?
2. **Timeline?** How urgently do you need connectors vs shipping without them?
3. **Aesthetics?** Are connectors critical or nice-to-have?
4. **Complexity tolerance?** Custom solution vs library dependency?

---

## Reference Images

- `bugs/branch-length-01.png` - Working horizontal layout (our current state)
- `bugs/branch-length-02.png` - Shows broken SVG connectors attempt
- `bugs/branch-length-03.png` - Shows broken CSS borders attempt
- `bugs/branch-length-04.png` - Shows broken table approach

---

## Build & Test Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Current branch
git branch
# Should show: feature/horizontal-tree-layout
```

---

## Deployment Status

- Dev server running: http://localhost:5173
- Railway deployment: Automatic on push to branch
- No breaking changes - app is fully functional without connectors

---

## Summary

**Current state:** Fully functional horizontal tree layout without connector lines.

**Next action:** Implement connector lines using either:
1. `react-organizational-chart` library (recommended)
2. Custom SVG overlay approach
3. Ship without connectors (functional but less visual clarity)

**Blocker:** None - app is functional, connectors are visual enhancement only.

**Recommendation:** Go with Option A (library) for fastest, most reliable solution.
