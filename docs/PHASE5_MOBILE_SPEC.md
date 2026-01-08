# Phase 5 Specification: Mobile-First Experience

## Overview

Transform the Powell Family Tree into a mobile-first application with comprehensive touch support, responsive layouts, and mobile-optimized interactions. Currently, the app has minimal mobile responsiveness (no Tailwind breakpoint classes, fixed widths, no touch gestures). This phase will make the tree exploration experience excellent on phones and tablets.

---

## Current Mobile Pain Points

### Critical Issues
1. **DetailPanel takes 85% of phone screens** (320px on 375px devices)
2. **SearchBar fixed at 256px** (68% of small phone width)
3. **No touch gestures** (pinch-to-zoom only works in React Flow)
4. **Fixed bottom legends overlap** on small screens
5. **Tree starts off-screen** due to fixed 100px translate offset

### Design Issues
6. Header crowding (7+ elements on one row)
7. Breadcrumbs horizontal scroll has no visual indicator
8. Node cards too small (220x80px with 14px text)
9. No mobile menu consolidation
10. Missing touch feedback (no `:active` states)

---

## Goals

1. **Excellent mobile UX** - Fast, intuitive tree exploration on phones
2. **Touch-first interactions** - Pinch, swipe, tap optimized
3. **Responsive layouts** - Adapt to 320px → 2560px screens
4. **Progressive enhancement** - Works great on mobile, even better on desktop
5. **Maintain design aesthetic** - Keep warm amber/sepia heritage theme

---

## Design Principles

### Mobile First
- Design for 375px viewport first (iPhone SE/13/14 standard width)
- Use Tailwind `md:` and `lg:` prefixes to enhance for larger screens
- Test on real devices, not just browser DevTools

### Touch Targets
- Minimum 44x44px tap targets (Apple HIG standard)
- Generous padding around interactive elements
- Visual feedback on touch (`:active` states)

### Content Hierarchy
- One primary action per screen section
- Progressive disclosure (hide advanced features until needed)
- Drawer/modal patterns for complex UI

### Performance
- Lazy load off-screen nodes
- Debounce touch gestures
- Minimize reflows during pan/zoom

---

## Implementation Plan

### Priority 1: Critical Mobile Fixes (Required)

#### 1.1 Responsive DetailPanel

**Problem:** Fixed `w-80` (320px) sidebar takes 85% of phone screens

**Solution:** Bottom sheet modal on mobile, sidebar on desktop

```jsx
// Mobile (< 768px): Bottom sheet that slides up from bottom
<div className="fixed inset-x-0 bottom-0 h-[70vh] md:right-0 md:inset-x-auto md:top-0 md:h-full md:w-80 lg:w-96">
  {/* Detail content */}
</div>

// Features:
// - Slides up from bottom on mobile (transform-translate animation)
// - Swipe-down-to-close gesture
// - Drag handle at top (visual affordance)
// - Semi-transparent backdrop
// - 70% viewport height (leaves tree visible)
// - Full sidebar on tablets/desktop
```

**Implementation Details:**

- Create `DetailPanelMobile.jsx` and `DetailPanelDesktop.jsx`
- Use `useMediaQuery` hook or Tailwind breakpoint detection
- Add touch handlers: `onTouchStart`, `onTouchMove`, `onTouchEnd`
- Track swipe velocity for "fling" dismiss
- Animate with CSS transitions (`transition-transform duration-300`)

**Acceptance Criteria:**
- [ ] Bottom sheet on mobile (< 768px)
- [ ] Swipe down to close works
- [ ] Drag handle visible and functional
- [ ] Backdrop click closes panel
- [ ] Smooth animation (60fps)
- [ ] Content scrollable inside panel
- [ ] Desktop sidebar unchanged

---

#### 1.2 Responsive SearchBar

**Problem:** Fixed `w-64` (256px) too wide for small phones

**Solution:** Full width on mobile, fixed width on desktop

```jsx
<div className="w-full sm:w-80 md:w-64">
  <SearchBar />
</div>

// Features:
// - Full width on phones (< 640px)
// - 320px on large phones (640-768px)
// - 256px on desktop (> 768px)
// - Dropdown adjusts to input width
// - Mobile keyboard handling (push content up, not zoom)
```

**Implementation Details:**

- Update SearchBar.jsx with responsive classes
- Add `input-mode="search"` for mobile keyboards
- Handle iOS keyboard dismiss (blur on outside tap)
- Increase tap target of search icon to 44x44px
- Consider search icon on right side on mobile (easier thumb reach)

**Acceptance Criteria:**
- [ ] Full width on small phones
- [ ] Keyboard doesn't zoom page
- [ ] Dropdown fits within viewport
- [ ] Search icon easily tappable
- [ ] Enter key submits search

---

#### 1.3 Touch Pan/Zoom for react-d3-tree

**Problem:** No pinch-to-zoom or touch pan in react-d3-tree version

**Solution:** Custom touch event handlers with gesture detection

```jsx
// Add to App.jsx tree container
const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    // Pinch detected - store initial distance
    const distance = getDistance(e.touches[0], e.touches[1]);
    setInitialPinchDistance(distance);
    setInitialZoom(currentZoom);
  } else if (e.touches.length === 1) {
    // Pan detected - store initial position
    setInitialTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }
};

const handleTouchMove = (e) => {
  if (e.touches.length === 2) {
    // Calculate new zoom based on pinch distance
    const distance = getDistance(e.touches[0], e.touches[1]);
    const scale = distance / initialPinchDistance;
    setZoom(initialZoom * scale);
  } else if (e.touches.length === 1) {
    // Calculate pan delta and update translate
    const dx = e.touches[0].clientX - initialTouchPos.x;
    const dy = e.touches[0].clientY - initialTouchPos.y;
    setTranslate({ x: translate.x + dx, y: translate.y + dy });
  }
};
```

**Implementation Details:**

- Add touch event listeners to tree container div
- Calculate distance between two touch points (pinch)
- Detect single vs multi-touch
- Prevent default scrolling during gestures
- Add momentum/inertia to pan (continues after release)
- Clamp zoom to min/max (0.1 to 2)

**Acceptance Criteria:**
- [ ] Two-finger pinch zooms tree
- [ ] Single-finger drag pans tree
- [ ] Smooth 60fps performance
- [ ] No page scroll during gestures
- [ ] Zoom clamped to reasonable range
- [ ] Works on iOS and Android

---

#### 1.4 Fix Bottom Legends Overlap

**Problem:** Left legend and right help text both at `bottom-4` overlap on small screens

**Solution:** Reposition to single bottom location on mobile

```jsx
// Mobile: Stack vertically at bottom-left
<div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-auto z-40">
  {/* Legend */}
</div>

<div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-auto z-40">
  {/* Help text */}
</div>

// OR: Combine into single collapsible help panel on mobile
<button className="fixed bottom-4 right-4 md:hidden">
  <HelpIcon />
</button>
```

**Implementation Details:**

- Option A: Stack legend and help text vertically on mobile
- Option B: Collapse both into expandable "Help" button
- Option C: Move to hamburger menu (if implemented)
- Use responsive positioning with Tailwind breakpoints

**Acceptance Criteria:**
- [ ] No overlap on screens < 768px
- [ ] Both legend and help accessible
- [ ] Doesn't obscure tree content
- [ ] Easy to dismiss/hide

---

#### 1.5 Responsive Tree Viewport

**Problem:** Initial `translate={{ x: 100 }}` starts tree off-screen on mobile

**Solution:** Calculate initial position based on viewport width

```jsx
const getInitialTranslate = () => {
  const width = treeContainerRef.current?.clientWidth || 400;
  const height = treeContainerRef.current?.clientHeight || 400;

  // Center root node on mobile, left-offset on desktop
  const x = width < 768 ? width / 2 : 100;
  const y = height / 2;

  return { x, y };
};

useEffect(() => {
  setTranslate(getInitialTranslate());
}, [treeContainerRef.current]);
```

**Implementation Details:**

- Calculate based on container dimensions
- On mobile: center root node horizontally
- On desktop: keep 100px left padding for aesthetics
- Recalculate on window resize
- Animate transition when switching users

**Acceptance Criteria:**
- [ ] Root node visible on load (mobile)
- [ ] No need to pan to see initial tree
- [ ] Works on portrait and landscape
- [ ] Smooth on orientation change

---

### Priority 2: Enhanced Mobile UX (Important)

#### 2.1 Responsive Header Layout

**Current:** 7+ elements in header crowd on mobile
**Solution:** Responsive stacking and grouping

```jsx
<header className="...">
  {/* Top row: Title + User selector */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <h1 className="text-2xl md:text-3xl lg:text-4xl">Powell Family Tree</h1>
    <select className="text-base md:text-sm">{/* Users */}</select>
  </div>

  {/* Second row: Search + Controls */}
  <div className="flex flex-col sm:flex-row gap-3 mt-3">
    <SearchBar className="flex-1" />
    <div className="flex gap-2 justify-end">
      <ExpandButton />
      <CollapseButton />
      <GenerationControl />
    </div>
  </div>
</header>
```

**Features:**
- Stack title above user selector on small phones
- Stack search above controls on phones
- Horizontal layout on tablets/desktop
- Responsive text sizes
- Touch-friendly button spacing

**Acceptance Criteria:**
- [ ] No crowding on 375px width
- [ ] Easy to tap all controls
- [ ] Logical visual hierarchy
- [ ] Smooth layout transitions

---

#### 2.2 Touch-Friendly Breadcrumbs

**Current:** Small arrow separators, no tap feedback, horizontal scroll hidden

**Solution:** Larger tap targets, visual scroll indicators

```jsx
<div className="relative">
  {/* Gradient fade on edges to indicate scroll */}
  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none md:hidden" />
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />

  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
    {ancestors.map((person, i) => (
      <React.Fragment key={person.id}>
        <button className="px-3 py-2 min-w-[44px] min-h-[44px] active:bg-amber-100">
          {person.name}
        </button>
        {i < ancestors.length - 1 && (
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        )}
      </React.Fragment>
    ))}
  </div>
</div>
```

**Features:**
- Gradient edge indicators for scroll
- Replace `→` with proper chevron icon
- Increase button padding to 44x44px minimum
- Add `:active` state for touch feedback
- Auto-scroll to show selected ancestor

**Acceptance Criteria:**
- [ ] All buttons 44x44px minimum
- [ ] Visual feedback on tap
- [ ] Scroll indicators visible
- [ ] Smooth scroll animation
- [ ] Selected item always visible

---

#### 2.3 Responsive Node Card Sizes

**Current:** Fixed 220x80px nodes with 14px text

**Solution:** Scale nodes based on viewport and zoom level

```jsx
// Responsive node dimensions
const getNodeDimensions = () => {
  const width = window.innerWidth;
  if (width < 640) return { width: 180, height: 70 };      // Small phones
  if (width < 768) return { width: 200, height: 75 };      // Large phones
  if (width < 1024) return { width: 220, height: 80 };     // Tablets
  return { width: 240, height: 90 };                       // Desktop
};

// Responsive text sizes via Tailwind
<div className="text-xs sm:text-sm md:text-base">
  {person.name}
</div>
```

**Features:**
- Smaller nodes on phones (180x70px)
- Standard nodes on desktop (240x90px)
- Responsive text sizing
- Larger expand/collapse buttons on mobile (36x36px)
- Emoji icons scale with node size

**Acceptance Criteria:**
- [ ] Readable text on all screen sizes
- [ ] Nodes fit well in mobile viewport
- [ ] Expand buttons easy to tap
- [ ] Layout doesn't break on zoom

---

#### 2.4 Mobile Gesture Suite

**New gestures for enhanced mobile UX**

```jsx
// Double-tap to focus on person
const handleDoubleTap = (personId) => {
  navigateToPerson(personId);
  centerOnPerson(personId);
  setZoom(1.2);  // Zoom in slightly
};

// Long-press for context menu
const handleLongPress = (personId) => {
  showContextMenu(personId, {
    actions: [
      'View Details',
      'Show Ancestry',
      'Show Descendants',
      'Copy Name'
    ]
  });
};

// Swipe left/right to change user view
const handleSwipe = (direction) => {
  if (direction === 'left') nextUser();
  if (direction === 'right') prevUser();
};
```

**Implementation:**
- Detect double-tap with timestamp check (< 300ms between taps)
- Detect long-press with timeout (> 500ms hold)
- Detect swipe with velocity and distance thresholds
- Add haptic feedback (if available: `navigator.vibrate(10)`)

**Acceptance Criteria:**
- [ ] Double-tap focuses and zooms to person
- [ ] Long-press shows context menu
- [ ] Swipe changes user (debounced)
- [ ] Haptic feedback on touch devices
- [ ] Gestures don't conflict with pan/zoom

---

### Priority 3: Polish & Enhancement (Nice to Have)

#### 3.1 Mobile Navigation Menu

**Hamburger menu to consolidate controls on mobile**

```jsx
<button className="md:hidden fixed top-4 right-4 z-50" onClick={toggleMenu}>
  <MenuIcon />
</button>

<div className={`fixed inset-0 bg-black/50 z-40 ${menuOpen ? 'block' : 'hidden'}`}>
  <div className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6">
    <SearchBar />
    <GenerationControl />
    <button>Expand All</button>
    <button>Collapse All</button>
    {/* Legend, Help moved here */}
  </div>
</div>
```

**Features:**
- Slide-in menu from right
- Contains search, controls, legend, help
- Backdrop click to close
- Swipe-to-close gesture

**Acceptance Criteria:**
- [ ] Menu accessible on mobile
- [ ] Smooth slide animation
- [ ] All controls functional in menu
- [ ] Closes automatically after action

---

#### 3.2 Keyboard Navigation

**Accessibility for keyboard users**

```jsx
// Arrow key navigation
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') navigateToParent();
    if (e.key === 'ArrowDown') navigateToChild();
    if (e.key === 'ArrowLeft') navigateToPreviousSibling();
    if (e.key === 'ArrowRight') navigateToNextSibling();
    if (e.key === 'Enter') openDetailPanel();
    if (e.key === 'Escape') closeDetailPanel();
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedPerson]);
```

**Features:**
- Arrow keys navigate tree
- Enter opens detail panel
- Escape closes panels
- Tab cycles through controls
- Focus indicators (`:focus-visible`)

**Acceptance Criteria:**
- [ ] All features keyboard accessible
- [ ] Focus indicators visible
- [ ] Logical tab order
- [ ] No keyboard traps

---

#### 3.3 Orientation Change Handling

**Optimize for landscape mode on phones**

```jsx
useEffect(() => {
  const handleOrientationChange = () => {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isLandscape && window.innerWidth < 768) {
      // Landscape phone mode
      setZoom(0.6);  // Zoom out to show more tree
      setDetailPanelHeight('50vh');  // Shorter panel
    } else {
      // Portrait or tablet
      setZoom(0.8);
      setDetailPanelHeight('70vh');
    }
  };

  window.addEventListener('orientationchange', handleOrientationChange);
  return () => window.removeEventListener('orientationchange', handleOrientationChange);
}, []);
```

**Features:**
- Detect orientation change
- Adjust zoom level for landscape
- Resize detail panel
- Recalculate tree viewport

**Acceptance Criteria:**
- [ ] Smooth transition on rotate
- [ ] Tree visible in landscape
- [ ] Detail panel usable in landscape
- [ ] No layout breaks

---

#### 3.4 Progressive Web App (PWA)

**Make app installable on mobile home screens**

**Create manifest.json:**
```json
{
  "name": "Powell Family Tree",
  "short_name": "Powell Tree",
  "description": "Explore the Powell family ancestry",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fef3c7",
  "theme_color": "#fbbf24",
  "icons": [
    {
      "src": "/tree-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/tree-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Create service-worker.js:**
- Cache GEDCOM file
- Cache app shell (HTML, CSS, JS)
- Offline fallback
- Background sync for future features

**Features:**
- Installable on iOS and Android
- Works offline
- Full-screen experience
- App icon on home screen
- Fast loading (cached assets)

**Acceptance Criteria:**
- [ ] Install prompt appears on mobile
- [ ] App runs offline
- [ ] Cached GEDCOM loads instantly
- [ ] Splash screen shows on launch
- [ ] Status bar themed

---

## Technical Architecture

### Component Structure

```
src/
├── components/
│   ├── mobile/
│   │   ├── DetailPanelMobile.jsx      # Bottom sheet for detail view
│   │   ├── MobileMenu.jsx             # Hamburger menu
│   │   └── TouchGestureHandler.jsx    # Centralized gesture detection
│   ├── DetailPanel.jsx                # Desktop sidebar
│   ├── SearchBar.jsx                  # Responsive search
│   ├── Breadcrumbs.jsx                # Responsive breadcrumbs
│   └── GenerationControl.jsx          # Responsive control
├── hooks/
│   ├── useMediaQuery.js               # Breakpoint detection
│   ├── useTouchGestures.js            # Touch gesture hooks
│   └── useKeyboardNav.js              # Keyboard navigation
├── utils/
│   ├── touchHelpers.js                # Touch distance, velocity calculations
│   └── viewportHelpers.js             # Responsive viewport calculations
├── App.jsx                            # Main react-d3-tree app
└── AppReactFlow.jsx                   # React Flow app
```

### New Dependencies

```json
{
  "dependencies": {
    "react-spring": "^9.7.3",           // Smooth animations for mobile gestures
    "use-gesture": "^10.3.0"            // Gesture detection library
  }
}
```

### Tailwind Configuration Updates

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '320px',      // Extra small phones
        'sm': '640px',      // Large phones
        'md': '768px',      // Tablets
        'lg': '1024px',     // Desktop
        'xl': '1280px',     // Large desktop
        '2xl': '1536px',    // Extra large
      },
      spacing: {
        '18': '4.5rem',     // 72px - for header spacing
        '22': '5.5rem',     // 88px - for bottom nav
      },
      minHeight: {
        'touch': '44px',    // Minimum touch target
      },
      minWidth: {
        'touch': '44px',
      }
    }
  }
}
```

---

## Responsive Breakpoint Strategy

### Mobile-First Approach

**Write CSS for mobile (320px-640px) first, then enhance for larger screens:**

```jsx
// ✅ CORRECT: Mobile first
className="w-full md:w-80 lg:w-96"  // Full width on mobile, fixed on desktop

// ❌ WRONG: Desktop first
className="w-96 md:w-full"  // Makes no sense, don't do this
```

### Breakpoint Usage

- **No prefix (320px+):** Small phones, design for this first
- **sm: (640px+):** Large phones, minor adjustments
- **md: (768px+):** Tablets, introduce sidebar layouts
- **lg: (1024px+):** Desktop, full feature set
- **xl: (1280px+):** Large desktop, extra whitespace

### Common Patterns

```jsx
// Stacking on mobile, row on desktop
className="flex flex-col md:flex-row"

// Full width on mobile, fixed on desktop
className="w-full md:w-auto"

// Hidden on mobile, visible on desktop
className="hidden md:block"

// Small text on mobile, larger on desktop
className="text-sm md:text-base lg:text-lg"

// Compact padding on mobile, generous on desktop
className="px-2 py-1 md:px-4 md:py-2"
```

---

## Testing Plan

### Device Testing Matrix

**Required test devices:**

| Device | OS | Screen | Orientation | Browser |
|--------|----|----|-------------|---------|
| iPhone SE | iOS 16+ | 375x667 | Portrait | Safari |
| iPhone 13/14 | iOS 16+ | 390x844 | Portrait | Safari |
| iPhone 13 Pro Max | iOS 16+ | 428x926 | Both | Safari |
| Samsung Galaxy S22 | Android 13+ | 360x800 | Portrait | Chrome |
| Google Pixel 7 | Android 13+ | 412x915 | Portrait | Chrome |
| iPad Air | iPadOS 16+ | 820x1180 | Both | Safari |
| iPad Pro 12.9" | iPadOS 16+ | 1024x1366 | Both | Safari |

**Testing tools:**
- Real devices (borrow from team/family)
- BrowserStack for cross-device testing
- Chrome DevTools responsive mode (quick checks only)

### Test Scenarios

**Critical paths to test on each device:**

1. **Load and Explore**
   - [ ] App loads in < 3 seconds on 4G
   - [ ] Initial tree visible without panning
   - [ ] All 4 users switch correctly
   - [ ] Pan and zoom smooth (60fps)

2. **Search**
   - [ ] Search bar full width on mobile
   - [ ] Keyboard doesn't zoom page
   - [ ] Dropdown visible and scrollable
   - [ ] Results navigate correctly
   - [ ] Keyboard "Go" button works

3. **Detail Panel**
   - [ ] Opens as bottom sheet on mobile
   - [ ] Swipe down to close works
   - [ ] Content scrollable
   - [ ] Tree still visible (30% viewport)
   - [ ] Close button accessible

4. **Touch Gestures**
   - [ ] Pinch to zoom works (both implementations)
   - [ ] Single-finger pan works
   - [ ] Double-tap focuses person
   - [ ] Long-press shows context menu
   - [ ] Swipe changes user

5. **Breadcrumbs**
   - [ ] Horizontal scroll works
   - [ ] Gradient indicators visible
   - [ ] All buttons tappable (44x44px)
   - [ ] Active state shows on tap

6. **Node Interactions**
   - [ ] Expand/collapse buttons tappable
   - [ ] Text readable at default zoom
   - [ ] Cards don't overlap
   - [ ] Tap to view details works

7. **Orientation Change**
   - [ ] Rotate phone (portrait ↔ landscape)
   - [ ] Layout adapts smoothly
   - [ ] No content cutoff
   - [ ] Zoom level adjusts

8. **Performance**
   - [ ] 60fps pan/zoom
   - [ ] No janky animations
   - [ ] Expand all completes in < 2s
   - [ ] Smooth scrolling

---

## Performance Targets

### Metrics

- **First Contentful Paint:** < 1.5s on 4G
- **Time to Interactive:** < 3s on 4G
- **Frame rate during pan/zoom:** 60fps
- **Bundle size:** < 500KB (gzipped)
- **GEDCOM parse time:** < 500ms

### Optimization Strategies

1. **Code splitting**
   - Lazy load mobile components
   - Separate bundle for react-d3-tree vs React Flow
   - Dynamic import for PWA service worker

2. **Asset optimization**
   - Compress GEDCOM file (gzip)
   - Optimize any added icons/images
   - Use system fonts where possible

3. **Render optimization**
   - Virtualize node rendering (only render visible nodes)
   - Debounce touch events (16ms / 60fps)
   - Use `React.memo` on node components
   - Memoize expensive calculations

4. **Touch gesture debouncing**
   - Pan: Update every 16ms max (60fps)
   - Zoom: Update every 16ms max
   - Search: Debounce 300ms

---

## Implementation Timeline

### Phase 5A: Critical Fixes (Week 1-2)

**Must-have for basic mobile usability**

- [ ] 1.1 Responsive DetailPanel (bottom sheet)
- [ ] 1.2 Responsive SearchBar (full width mobile)
- [ ] 1.3 Touch pan/zoom (react-d3-tree)
- [ ] 1.4 Fix bottom legends overlap
- [ ] 1.5 Responsive tree viewport (initial position)

**Deliverable:** Mobile-usable tree with bottom sheet and touch support

---

### Phase 5B: Enhanced UX (Week 3)

**Important for great mobile experience**

- [ ] 2.1 Responsive header layout (stacking)
- [ ] 2.2 Touch-friendly breadcrumbs (44px targets)
- [ ] 2.3 Responsive node sizes (180px on mobile)
- [ ] 2.4 Mobile gesture suite (double-tap, long-press, swipe)

**Deliverable:** Polished mobile experience with gestures

---

### Phase 5C: Polish (Week 4)

**Nice to have for exceptional UX**

- [ ] 3.1 Mobile navigation menu (hamburger)
- [ ] 3.2 Keyboard navigation (arrow keys)
- [ ] 3.3 Orientation change handling
- [ ] 3.4 Progressive Web App (installable)

**Deliverable:** Professional mobile app with PWA support

---

## Success Criteria

### Phase 5 is complete when:

**Functional Requirements:**
- [ ] All features work on 375px viewport
- [ ] Touch gestures implemented (pinch, pan, double-tap, long-press, swipe)
- [ ] DetailPanel doesn't block tree on mobile
- [ ] SearchBar fits on small screens
- [ ] All buttons meet 44x44px minimum tap target
- [ ] Tree viewport shows root node on load (mobile)

**Quality Requirements:**
- [ ] 60fps pan/zoom performance
- [ ] No layout breaks on 320px-2560px range
- [ ] Works on iOS Safari and Android Chrome
- [ ] Smooth animations (no jank)
- [ ] Keyboard accessible (all features)

**Testing Requirements:**
- [ ] Tested on 3+ real mobile devices
- [ ] All 4 users work on mobile
- [ ] Portrait and landscape tested
- [ ] No console errors on mobile browsers
- [ ] Production build succeeds

**Documentation:**
- [ ] Mobile testing guide updated
- [ ] Gesture documentation added
- [ ] Responsive patterns documented in CLAUDE.md
- [ ] Screenshots of mobile layouts

---

## Migration Notes

### Breaking Changes

- None expected - this is enhancement only

### Backwards Compatibility

- Desktop experience unchanged (only enhanced)
- All existing features remain functional
- Users on old browsers gracefully degrade

### Rollout Strategy

1. **Feature branch:** `feature/phase5-mobile-experience`
2. **Railway dev deployment:** Test on real mobile devices
3. **Staging deployment:** Full QA with family members on phones
4. **Production deployment:** Monitor for mobile-specific issues

### Rollback Plan

- If critical issues found, revert PR
- Mobile issues shouldn't affect desktop users
- GEDCOM data unchanged, no migration needed

---

## Accessibility Considerations

### Touch Accessibility

- **Tap targets:** 44x44px minimum (Apple HIG)
- **Active states:** Visual feedback on touch
- **Focus indicators:** Visible keyboard focus (`:focus-visible`)

### Screen Reader Support

- **Semantic HTML:** Use `<nav>`, `<button>`, `<main>`
- **ARIA labels:** Add to icon-only buttons
- **Focus management:** Trap focus in modal/drawer
- **Announce changes:** Use `aria-live` for dynamic content

### Keyboard Navigation

- **Tab order:** Logical sequence
- **Escape key:** Closes modals/panels
- **Arrow keys:** Navigate tree
- **Enter/Space:** Activate buttons

---

## Related Documentation

- **Phase 4 Spec:** [PHASE4_FAMILY_DATA_ENRICHMENT.md](PHASE4_FAMILY_DATA_ENRICHMENT.md) - Previous phase
- **React Flow vs D3:** [REACT_FLOW_VS_D3_TREE.md](REACT_FLOW_VS_D3_TREE.md) - Implementation comparison
- **Testing Guide:** [TESTING_BOTH_IMPLEMENTATIONS.md](TESTING_BOTH_IMPLEMENTATIONS.md) - How to test
- **UI/UX Research:** [UI_UX_RESEARCH.md](UI_UX_RESEARCH.md) - Design principles
- **CLAUDE.md:** Development guide (will be updated with mobile patterns)

---

## Open Questions

1. **Bottom sheet vs full-screen modal?**
   - Bottom sheet preserves tree visibility (recommended)
   - Full-screen better for dense content
   - **Decision:** Bottom sheet (70% viewport height)

2. **React Flow vs react-d3-tree for mobile?**
   - React Flow has built-in pinch support
   - react-d3-tree needs custom implementation
   - **Decision:** Implement touch for both, let users choose

3. **Hamburger menu or persistent controls?**
   - Hamburger reduces clutter
   - Persistent more discoverable
   - **Decision:** Persistent for Phase 5A, hamburger optional in 5C

4. **PWA priority?**
   - Nice to have for installability
   - Requires service worker complexity
   - **Decision:** Phase 5C (optional enhancement)

5. **Offline support scope?**
   - Full offline with cached GEDCOM
   - Or online-only
   - **Decision:** Online-only for 5A/5B, offline in 5C with PWA

---

## Notes

- This spec follows the spec-driven development process from CLAUDE.md
- All responsive classes use Tailwind breakpoints (sm:, md:, lg:)
- Touch gestures use standard web APIs (TouchEvent, not libraries initially)
- Performance targets based on Lighthouse mobile metrics
- Testing strategy emphasizes real devices over emulators

---

**Created:** 2026-01-08
**Author:** Claude Code
**Status:** Draft - Ready for review and Phase 5A implementation
