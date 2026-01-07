# Horizontal Tree Layout Specification

## Overview
Convert the family tree from a vertical (top-down) layout to a horizontal (left-to-right) layout where the root user is on the left and ancestors extend to the right.

## Problem Statement
The current vertical tree layout has several issues:
1. **Broken connections** - When fully expanded, SVG curves between nodes break due to wide horizontal spread
2. **Poor space utilization** - Vertical layout doesn't use widescreen displays efficiently
3. **Difficult tracking** - Long vertical curves make it hard to follow lineage
4. **Scalability issues** - Deep ancestry trees overflow vertically

## Proposed Solution
Implement a horizontal tree where:
- Root user appears on the **left side** of the screen
- Parents appear to the **right** of their children
- Father appears **above** the connecting line, mother **below**
- Simple horizontal lines connect children to parents

## Visual Layout

```
                                    ┌─── Great-Grandfather (Father's Father's Father)
                          ┌─── Grandfather (Father's Father)
                          │         └─── Great-Grandmother (Father's Father's Mother)
            ┌─── Father ──┤
            │             │         ┌─── Great-Grandfather (Father's Mother's Father)
            │             └─── Grandmother (Father's Mother)
You (Root) ─┤                       └─── Great-Grandmother (Father's Mother's Mother)
            │
            │             ┌─── Grandfather (Mother's Father)
            └─── Mother ──┤
                          └─── Grandmother (Mother's Mother)
```

## Technical Implementation

### 1. Layout Structure
**Current (Vertical):**
```jsx
<div className="flex flex-col items-center">
  <PersonCard />
  <div className="flex gap-8"> {/* Parents side by side */}
    <Parent1 />
    <Parent2 />
  </div>
</div>
```

**New (Horizontal):**
```jsx
<div className="flex items-center gap-8">
  <PersonCard />
  <div className="flex flex-col gap-6"> {/* Parents stacked vertically */}
    <Parent1 />
    <Parent2 />
  </div>
</div>
```

### 2. Connection Lines
**Replace curves with:**
- Horizontal line from child card to a vertical line
- Vertical line connecting to both parents
- Short horizontal lines from vertical line to each parent

**SVG Path Structure:**
```
Child ───┬─── Parent 1 (Father)
         │
         └─── Parent 2 (Mother)
```

### 3. Spacing
- **Horizontal gap between generations:** 80-120px (adjustable)
- **Vertical gap between parents:** 40-60px (adjustable)
- **Connection line offsets:**
  - Start from right edge of child card
  - End at left edge of parent cards

### 4. Expand/Collapse Button
- Move from bottom of card to **right edge** of card
- Point right (►) when collapsed, down (▼) when expanded

## Component Changes

### AncestryBranch Component
**Key changes:**
1. Change main container from `flex-col` to `flex-row`
2. Stack parents vertically instead of horizontally
3. Recalculate SVG connection paths for horizontal layout
4. Update expand button position and icon direction

### PersonCard Component
**Minimal changes:**
1. Adjust expand button position (right edge instead of bottom)
2. Rotate expand icon 90° (► instead of ▼)

### PannableCanvas Component
**Adjustments:**
1. Update initial position to account for horizontal layout
2. Adjust padding to ensure root node starts on left side
3. May need to adjust zoom default based on horizontal spread

## Acceptance Criteria

### Layout
- [ ] Root user appears on the left side of viewport
- [ ] Parents appear to the right of their children
- [ ] Father appears above the horizontal line to parents
- [ ] Mother appears below the horizontal line to parents
- [ ] Consistent spacing between generations
- [ ] Consistent vertical spacing between siblings

### Connections
- [ ] Clean horizontal lines connect children to parents
- [ ] Lines connect properly regardless of tree depth
- [ ] Lines don't overlap or break when fully expanded
- [ ] Lines are visually clear and easy to follow

### Interactions
- [ ] Expand/collapse buttons on right edge of cards
- [ ] Expanding shows parents to the right
- [ ] Collapsing hides parents smoothly
- [ ] Pan and zoom work correctly with horizontal layout
- [ ] "Expand All" works without breaking connections
- [ ] Search navigation works correctly

### Responsiveness
- [ ] Works on widescreen displays (1920px+)
- [ ] Works on standard laptop screens (1366px+)
- [ ] Gracefully handles narrow viewports (mobile)
- [ ] Horizontal scrolling/panning works smoothly

### Visual Polish
- [ ] Maintains warm amber/sepia color palette
- [ ] Card styling remains consistent
- [ ] Smooth transitions on expand/collapse
- [ ] Connection lines match design aesthetic
- [ ] No visual glitches during interactions

### Testing
- [ ] All 4 user views load correctly
- [ ] Expand/collapse works at all levels
- [ ] "Expand All" with generation limit works
- [ ] Search and navigate to person works
- [ ] Breadcrumbs update correctly
- [ ] Detail panel opens on card click
- [ ] No console errors

## Implementation Plan

### Phase 1: Basic Horizontal Layout
1. Update `AncestryBranch` container to use `flex-row`
2. Stack parents vertically with `flex-col`
3. Adjust spacing and gaps
4. Test basic rendering

### Phase 2: Connection Lines
1. Remove existing curved SVG paths
2. Implement horizontal connection line logic
3. Calculate positions for T-junction connector
4. Test connections at various depths

### Phase 3: Expand/Collapse UI
1. Move expand button to right edge of card
2. Update icon direction (► / ▼)
3. Test expand/collapse animations
4. Ensure smooth transitions

### Phase 4: Layout Optimization
1. Fine-tune spacing between generations
2. Adjust vertical gaps between parents
3. Optimize for different screen sizes
4. Test with "Expand All" functionality

### Phase 5: Integration & Testing
1. Test all 4 user views
2. Test search navigation
3. Test breadcrumb navigation
4. Test generation control
5. Verify pan/zoom behavior
6. Cross-browser testing
7. Mobile responsiveness check

## Design Considerations

### Spacing Options
**Option A: Compact** (recommended for large trees)
- Horizontal: 60px
- Vertical: 30px

**Option B: Comfortable** (recommended for smaller trees)
- Horizontal: 100px
- Vertical: 50px

**Option C: Spacious**
- Horizontal: 140px
- Vertical: 70px

### Connection Line Styles
**Option A: Simple T-connector** (recommended)
```
─────┬───
     │
     └───
```

**Option B: Rounded connector**
```
─────┐
     ├───
     └───
```

**Option C: Bezier curve** (horizontal)
```
─────╮
     ├───
     ╰───
```

### Mobile Considerations
For narrow screens (< 768px):
- Consider reducing horizontal spacing
- May need to reduce card width
- Ensure touch targets remain 44px minimum
- Test horizontal pan performance

## Migration Notes
- Existing state management remains unchanged
- No changes to GEDCOM parsing logic
- Breadcrumb logic remains the same
- Search functionality unaffected
- Only visual layout changes required

## Performance Considerations
- Horizontal layout may improve performance (less vertical reflow)
- Connection lines simpler (less SVG calculation)
- May need to implement virtualization for very wide trees (20+ generations)

## Future Enhancements
- Configurable spacing via UI control
- Toggle between horizontal/vertical layouts
- Minimap for navigation of large trees
- Collapse individual branches
- Print-optimized horizontal layout

## Rollback Plan
If issues arise:
1. Keep vertical layout in separate branch
2. Feature flag to toggle between layouts
3. Easy rollback via git revert

## Success Metrics
- No broken connection lines when fully expanded
- Better visual clarity of lineage
- Improved user feedback on horizontal layout
- No performance regressions
- All existing features continue to work
