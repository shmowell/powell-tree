# Claude Development Guide - Powell Family Tree

## Project Overview

React-based family tree visualization for the Powell family with 4,915 individuals from GEDCOM data. 4 family members can explore their ancestry through an interactive web interface.

**Live URL:** Deployed on Railway (auto-deploys from GitHub)
**Tech Stack:** React 18, Vite, Tailwind CSS, GEDCOM parser

---

## Development Philosophy

### CRITICAL: Spec-Driven Development Process

**ALWAYS follow this exact sequence for ANY code changes**

#### Step 1: Create Feature Branch FIRST

```bash
# Check current branch
git branch

# Create feature branch BEFORE any code changes
git checkout -b feature/descriptive-name

# Example: git checkout -b feature/phase1-search-breadcrumbs
```

#### Step 2: Write Specification BEFORE Coding

- Create or update a spec document describing WHAT will be built
- Include acceptance criteria
- Define component interfaces and props
- Describe user interactions
- List test cases
- Get user approval if needed

#### Step 3: Read Existing Code

- Review [CLAUDE_CODE_HANDOVER.md](docs/CLAUDE_CODE_HANDOVER.md) for architecture
- Check [TECHNICAL_IMPLEMENTATION.md](docs/TECHNICAL_IMPLEMENTATION.md) for implementation patterns
- Review [UI_UX_RESEARCH.md](docs/UI_UX_RESEARCH.md) for design decisions
- Read related source files

#### Step 4: Implementation

- Follow the spec exactly
- Follow existing code style and patterns
- Maintain the warm amber/sepia color palette
- Keep components modular and reusable
- Add comments for complex logic only

#### Step 5: Testing

- Test locally before committing
- Verify all 4 user views work correctly
- Test expand/collapse functionality
- Check pan and zoom interactions
- Test on different screen sizes
- Verify spec acceptance criteria met

#### Step 6: Commit and Push

- Use conventional commit messages
- Push feature branch to GitHub
- Create PR with spec summary

### ⚠️ NEVER Code Without These Prerequisites

1. ❌ NEVER make code changes on `main` branch
2. ❌ NEVER start coding without a feature branch
3. ❌ NEVER skip writing/reviewing the spec
4. ❌ NEVER commit untested code
5. ❌ NEVER push directly to main

### ✅ Always Follow This Order

1. ✅ Create feature branch
2. ✅ Write/review spec
3. ✅ Read existing code
4. ✅ Implement according to spec
5. ✅ Test thoroughly
6. ✅ Commit with good message
7. ✅ Push and create PR

---

## File Structure

```
powell-tree/
├── public/
│   └── family.ged              # GEDCOM data (4,915 individuals)
├── src/
│   ├── App.jsx                 # Main component with state management
│   ├── components/             # Feature components (create as needed)
│   ├── gedcomParser.js         # GEDCOM parsing utilities
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind imports
├── docs/
│   ├── CLAUDE_CODE_HANDOVER.md # Architecture documentation
│   ├── TECHNICAL_IMPLEMENTATION.md # Implementation examples
│   ├── UI_UX_RESEARCH.md       # UX research and recommendations
│   └── PHASE1_SPEC.md          # Phase 1 feature specification
├── claude.md                   # This file - Claude Code instructions
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── railway.json                # Railway deployment config
```

---

## GitHub Best Practices

### Branch Strategy

**Main Branch Protection**
- `main` branch auto-deploys to Railway
- Never push directly to `main`
- Always work in feature branches

**Feature Branch Naming**
```
feature/search-functionality
feature/breadcrumb-trail
fix/zoom-reset-bug
enhancement/generation-control
```

### Commit Message Format

```
type: Brief description (50 chars or less)

- Detailed explanation of changes
- Why the change was needed
- Any breaking changes or migrations

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:** `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`

**Examples:**
```
feat: Add search bar with fuzzy name matching

- Implemented SearchBar component with dropdown results
- Added navigateToPerson function to expand path to selected ancestor
- Integrated with existing pan/zoom system

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop and Test Locally**
   ```bash
   npm run dev          # Start dev server
   npm run build        # Test production build
   ```

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Your feature description"
   ```

4. **Push to GitHub**
   ```bash
   git push -u origin feature/your-feature-name
   ```

5. **Test on Railway Dev Environment**
   - Wait ~2 minutes for Railway dev deployment
   - Visit dev URL (e.g., `https://powell-tree-dev.up.railway.app`)
   - Test all 4 user views
   - Verify features work as expected
   - Check mobile responsiveness
   - Test on different browsers
   - If issues found, fix and push again (repeat this step)

6. **Create Pull Request to Staging**
   - **Base branch:** `staging` (not main!)
   - Use descriptive title matching commit message
   - Include summary of changes
   - Include link to Railway dev deployment for review
   - Reference any related issues
   - Add screenshots for UI changes
   - Test plan checklist with results from dev environment

7. **PR Review Checklist (to staging)**
   - [ ] Code follows existing patterns
   - [ ] Tested on Railway dev environment
   - [ ] All 4 user views tested
   - [ ] No console errors
   - [ ] Mobile responsive
   - [ ] Maintains design aesthetic
   - [ ] Production build succeeds

8. **Merge to Staging**
   - Squash and merge preferred
   - Railway staging auto-deploys (~2 minutes)
   - Full QA on staging URL
   - Test with all other staging features
   - Get approval for production release

9. **Create Pull Request to Main**
   - **Base branch:** `main`
   - Title: "Release: [Feature name] to production"
   - Reference staging PR
   - Include staging test results
   - Link to staging deployment

10. **Merge to Main**
    - Squash and merge preferred
    - Railway production auto-deploys (~2 minutes)
    - Verify production deployment at production URL
    - Smoke test: Check all 4 users load correctly
    - Monitor for issues

---

## Railway Deployment

### Deployment Environments

This project uses **three Railway environments**:

1. **Production** - Auto-deploys from `main` branch
   - URL: `https://powell-tree-production.up.railway.app` (or your production URL)
   - Stable, tested features only
   - User-facing
   - Protected branch

2. **Staging** - Auto-deploys from `staging` branch
   - URL: `https://powell-tree-staging.up.railway.app` (or your staging URL)
   - For final QA before production
   - Integration testing environment
   - Merge feature branches here first

3. **Development** - Auto-deploys from feature branches (e.g., `feature/*`)
   - URL: `https://powell-tree-dev.up.railway.app` (or your dev URL)
   - For testing individual features during development
   - Quick iteration and testing

### Setting Up Staging Branch and Environment

#### 1. Create Staging Branch in GitHub

```bash
# From main branch, create staging
git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging
```

#### 2. Protect Staging Branch (Recommended)

In GitHub repository settings:
- Go to Settings → Branches → Add branch protection rule
- Branch name pattern: `staging`
- Enable "Require pull request reviews before merging"
- Enable "Require status checks to pass before merging"

#### 3. Create Staging Service in Railway

1. **Add Staging Service**
   - Go to your Railway project
   - Click "New Service"
   - Connect to same GitHub repository
   - Name it "powell-tree-staging"

2. **Configure Branch Deployment**
   - In Railway service settings → "Deployments"
   - Set "Source" to `staging` branch
   - Save settings

3. **Configure Build Settings** (same as production)
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run preview",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

4. **Get Staging URL**
   - Railway provides a unique URL (e.g., `https://powell-tree-staging.up.railway.app`)
   - Add to your documentation
   - Share with team for QA

### Setting Up Dev Environment in Railway

1. **Create Dev Service in Railway Dashboard**
   - Go to your Railway project
   - Click "New Service"
   - Connect to same GitHub repository
   - Name it "powell-tree-dev"

2. **Configure Branch Deployment**
   - In Railway service settings → "Deployments"
   - Set "Source" to your feature branch (e.g., `feature/phase1-navigation-enhancements`)
   - Or use a wildcard pattern like `feature/*`
   - Enable "Watch Paths" if needed

3. **Configure Build Settings** (same as production)
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run preview",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

4. **Get Dev URL**
   - Railway will provide a unique URL for dev environment
   - Add to your documentation/bookmarks
   - Share with team for QA

### Deployment Workflow

**Complete workflow with staging:**

1. **Feature Development**
   - Create feature branch from `main`
   - Implement features per spec
   - Push to GitHub → Railway dev auto-deploys
   - Test on dev URL
   - Iterate and fix issues

2. **Merge to Staging**
   - Create PR from feature branch to `staging`
   - Review and merge
   - Railway staging auto-deploys
   - Full QA testing on staging URL
   - Integration testing with other features
   - User acceptance testing (if applicable)

3. **Merge to Production**
   - Create PR from `staging` to `main`
   - Final review
   - Merge to main
   - Railway production auto-deploys
   - Smoke test production
   - Monitor for issues

**Quick workflow (simple features):**

1. Feature branch → Railway dev → Test
2. PR to staging → Railway staging → QA
3. PR to main → Railway production → Verify

**Emergency hotfix workflow:**

1. Create hotfix branch from `main`
2. Fix critical issue
3. PR directly to `main` (skip staging for emergencies)
4. After production deploy, merge back to `staging`

### How It Works

1. **Automatic Deployment**
   - **Production**: Push to `main` → deploys to production Railway service
   - **Development**: Push to feature branch → deploys to dev Railway service
   - Railway runs `npm run build`
   - Serves from `dist/` folder
   - Deployment takes ~2 minutes

2. **Build Configuration** (railway.json)
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run preview",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

3. **Environment**
   - No environment variables required
   - Static file hosting
   - GEDCOM file served from `public/`
   - Same configuration for both prod and dev

### Deployment Checklist

**Before pushing to feature branch:**
- [ ] `npm run build` succeeds locally
- [ ] `npm run preview` works locally (<http://localhost:4173>)
- [ ] No TypeScript/ESLint errors
- [ ] All assets load correctly

**After pushing to feature branch (Railway dev):**
- [ ] Railway dev deployment succeeds (check Railway logs)
- [ ] Dev URL loads correctly
- [ ] All 4 users load and display properly
- [ ] New features work as expected
- [ ] No console errors in browser
- [ ] Mobile responsive (test on phone or DevTools)
- [ ] GEDCOM file loads (`/family.ged`)
- [ ] All interactions work (pan, zoom, expand, etc.)

**Before merging to staging:**
- [ ] All dev environment tests passed
- [ ] PR reviewed and approved
- [ ] No merge conflicts with staging
- [ ] Feature is complete per spec

**After merging to staging (Railway staging):**
- [ ] Railway staging deployment succeeds
- [ ] Staging URL loads correctly
- [ ] Full regression testing completed
- [ ] Integration with other staging features verified
- [ ] No console errors or warnings
- [ ] Performance acceptable
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari)
- [ ] Mobile testing completed

**Before merging to main:**
- [ ] All staging tests passed
- [ ] Product owner/stakeholder approval
- [ ] PR to main reviewed and approved
- [ ] No merge conflicts with main
- [ ] Release notes prepared (if needed)

### Troubleshooting Deployment

**Build Fails:**
- Check Railway logs for errors
- Verify `package.json` scripts
- Ensure all dependencies in `package.json`

**App Not Loading:**
- Check Railway logs for runtime errors
- Verify `vite.config.js` has correct base path
- Check asset paths are relative

**GEDCOM Not Loading:**
- Verify file is in `public/` folder
- Check fetch path in [App.jsx](src/App.jsx)
- Check Railway serves static files

---

## Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# In another terminal, watch for changes
npm run build -- --watch
```

### Making Changes

1. **Read existing code first**
   ```bash
   # For UI changes
   cat src/App.jsx

   # For data parsing
   cat src/gedcomParser.js
   ```

2. **Create component if needed**
   ```bash
   mkdir -p src/components
   touch src/components/SearchBar.jsx
   ```

3. **Follow existing patterns**
   - Use Tailwind utility classes
   - Match amber color palette
   - Use `rounded-2xl`, `rounded-full` for consistency
   - Shadow: `shadow-lg`, `shadow-amber-200/50`

4. **Test incrementally**
   - Save and check browser
   - Test all user views
   - Check console for errors

### Before Committing

```bash
# Verify build works
npm run build

# Preview production build
npm run preview

# Check for issues
npm run lint  # if configured
```

---

## Code Style Guidelines

### React Patterns

**Component Structure:**
```jsx
import React, { useState, useEffect, useMemo } from 'react';

export function ComponentName({ prop1, prop2, onAction }) {
  // State
  const [state, setState] = useState(initial);

  // Memoized values
  const computed = useMemo(() => {
    return expensiveCalculation();
  }, [dependencies]);

  // Effects
  useEffect(() => {
    // side effects
    return () => {
      // cleanup
    };
  }, [dependencies]);

  // Event handlers
  const handleAction = () => {
    onAction(data);
  };

  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

**State Management:**
- Use `useState` for local state
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed as props
- Lift state up when multiple components need it

### Tailwind CSS Patterns

**Color Palette:**
- Background: `bg-amber-50`, `bg-yellow-50`, `bg-orange-50`
- Cards: `bg-white/90`
- Borders: `border-stone-200`, `border-stone-300`
- Text: `text-stone-800` (primary), `text-stone-500` (secondary)
- Accents: `bg-amber-400`, `hover:bg-amber-500`, `text-amber-600`

**Common Classes:**
```jsx
// Buttons
className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-full shadow-lg"

// Cards
className="bg-white/90 rounded-2xl border border-stone-200 shadow-lg shadow-amber-200/50"

// Inputs
className="px-4 py-2 bg-white/90 rounded-full border border-stone-300 focus:ring-2 focus:ring-amber-400"

// Panels
className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl"
```

### Performance Considerations

**For Large Trees (600+ nodes):**
- Use `useMemo` for tree calculations
- Avoid re-renders with `React.memo` where appropriate
- Only render visible nodes (virtualization)
- Debounce search input
- Lazy load deep ancestors

**SVG Performance:**
- Limit visible curves
- Use `will-change` CSS for animations
- Consider Canvas for 1000+ nodes

---

## Feature Implementation Checklist

### Adding a New Feature

- [ ] Read relevant documentation sections
- [ ] Check [TECHNICAL_IMPLEMENTATION.md](TECHNICAL_IMPLEMENTATION.md) for examples
- [ ] Read existing related code
- [ ] Create feature branch
- [ ] Implement component(s)
- [ ] Integrate with [App.jsx](src/App.jsx)
- [ ] Test with all 4 users
- [ ] Test expand/collapse behavior
- [ ] Test pan and zoom
- [ ] Test on mobile
- [ ] Build for production
- [ ] Commit with descriptive message
- [ ] Push and create PR
- [ ] Merge to main
- [ ] Verify Railway deployment

### Feature-Specific Testing

**Search Functionality:**
- [ ] Finds matches by first name
- [ ] Finds matches by last name
- [ ] Finds matches by full name
- [ ] Handles no results gracefully
- [ ] Dropdown closes on selection
- [ ] Navigates to correct person
- [ ] Expands path to person

**Breadcrumbs:**
- [ ] Shows correct ancestry path
- [ ] Updates when selection changes
- [ ] Clickable segments work
- [ ] Relationship labels accurate

**Generation Control:**
- [ ] Limits visible generations
- [ ] Updates tree correctly
- [ ] Expand All respects limit
- [ ] UI control clear and intuitive

---

## Common Tasks

### Adding a New Component

```bash
# Create component file
touch src/components/NewComponent.jsx

# Component template
cat > src/components/NewComponent.jsx << 'EOF'
import React from 'react';

export function NewComponent({ prop1, onAction }) {
  return (
    <div className="bg-white/90 rounded-2xl p-4 border border-stone-200">
      {/* Component content */}
    </div>
  );
}
EOF

# Import in App.jsx
# Add: import { NewComponent } from './components/NewComponent';
```

### Updating GEDCOM Parser

```bash
# Edit parser
nano src/gedcomParser.js

# Common functions:
# - parseGedcom(gedcomText) - Parse GEDCOM to data
# - buildAncestryTree(personId, individuals, families, depth, maxDepth)
# - findPersonByName(name, individuals)
# - getAllIndividuals(individuals)
```

### Styling Changes

```bash
# Edit tailwind config for global changes
nano tailwind.config.js

# For component-specific styles, use utility classes
# Avoid custom CSS unless absolutely necessary
```

---

## Debugging Guide

### Common Issues

**Tree Not Rendering:**
1. Check console for errors
2. Verify `familyData` in [App.jsx](src/App.jsx)
3. Check `parsedData` state
4. Verify GEDCOM fetch succeeded

**Curves Not Connecting:**
1. Check ref measurements in `AncestryBranch`
2. Verify DOM nodes rendered before measuring
3. Check SVG viewBox and positioning

**Search Not Working:**
1. Verify `individuals` prop passed correctly
2. Check `parseGedcom` returns data
3. Console.log search results
4. Verify `navigateToPerson` logic

**Pan/Zoom Issues:**
1. Check `PannableCanvas` event listeners
2. Verify transform state
3. Check CSS overflow settings

### Development Tools

```bash
# React DevTools - Chrome/Firefox extension
# Inspect component state and props

# Vite dev server shows errors
npm run dev

# Build errors
npm run build

# Production preview
npm run preview
```

---

## Resources

### Documentation
- [CLAUDE_CODE_HANDOVER.md](CLAUDE_CODE_HANDOVER.md) - Architecture overview
- [TECHNICAL_IMPLEMENTATION.md](TECHNICAL_IMPLEMENTATION.md) - Code examples
- [UI_UX_RESEARCH.md](UI_UX_RESEARCH.md) - UX research
- [README.md](README.md) - Getting started

### External Resources
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [GEDCOM Specification](https://www.familysearch.org/developers/docs/gedcom/)
- [Railway Docs](https://docs.railway.app)

### Component Libraries (if needed)
```bash
# Fuzzy search
npm install fuse.js

# Date handling
npm install date-fns

# Tree layouts
npm install d3-hierarchy
```

---

## Phase 1 Implementation Guide

### Priority Features

1. **Search Functionality**
   - Location: Header, below title
   - Implementation: [TECHNICAL_IMPLEMENTATION.md](TECHNICAL_IMPLEMENTATION.md) lines 1-145
   - Component: `SearchBar.jsx`

2. **Breadcrumb Trail**
   - Location: Below header or above tree
   - Implementation: [TECHNICAL_IMPLEMENTATION.md](TECHNICAL_IMPLEMENTATION.md) lines 147-240
   - Component: `Breadcrumbs.jsx`

3. **Generation Depth Control**
   - Location: Header area
   - Implementation: [TECHNICAL_IMPLEMENTATION.md](TECHNICAL_IMPLEMENTATION.md) lines 242-272
   - Component: `GenerationControl.jsx`

4. **Focus and Zoom Improvements**
   - Add "Fit to Screen" button
   - Add "Focus on Person" functionality
   - Improve zoom controls

### Implementation Order

1. Create `src/components/` directory
2. Implement SearchBar component
3. Integrate search with App.jsx
4. Test search navigation
5. Implement Breadcrumbs component
6. Test breadcrumb navigation
7. Implement GenerationControl
8. Test generation limiting
9. Improve zoom controls
10. Test complete Phase 1
11. Create PR and merge

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Search finds ancestors by name
- [ ] Search navigates and expands path
- [ ] Breadcrumbs show ancestry path
- [ ] Breadcrumbs navigate correctly
- [ ] Generation control limits depth
- [ ] Zoom improvements implemented
- [ ] All 4 users tested
- [ ] Mobile responsive
- [ ] Production build succeeds
- [ ] Deployed to Railway

---

## Contact & Support

**Project Owner:** Will Powell
**Repository:** GitHub (check remote for URL)
**Deployment:** Railway

For questions or issues, refer to documentation or create GitHub issue.
