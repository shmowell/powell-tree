# 🌳 Powell Family Tree

An interactive horizontal family tree website for the Powell family with 4,915 individuals from GEDCOM data.

![Family Tree Preview](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-cyan) ![React_Flow](https://img.shields.io/badge/ReactFlow-11-green) ![react_d3_tree](https://img.shields.io/badge/react--d3--tree-3-orange)

## Features

### Core Features

- **Horizontal Tree Layout** — Root person on left, ancestors extending right
- **Dual Implementations** — Choose between react-d3-tree or React Flow
- **Interactive Navigation** — Expand and collapse ancestor branches with +/− buttons
- **Search Functionality** — Find any ancestor by name
- **Breadcrumb Trail** — See and navigate the ancestry path
- **Generation Control** — Limit visible generations (1-10+)
- **Person Details** — Click any card to view detailed information
- **Pan & Zoom** — Navigate large trees smoothly
- **4 User Views** — Switch between family members' perspectives

### React Flow Version (Enhanced)

- **Professional Controls** — Zoom +/−, fit view, fullscreen toggle
- **Minimap** — Bird's eye view for large tree navigation
- **Dot Grid Background** — Better spatial awareness
- **Optimized Performance** — Handles 1000+ nodes smoothly
- **Dagre Layout** — Automatic tree positioning

### react-d3-tree Version (Simple)

- **Lightweight** — Smaller bundle size
- **Tree-Focused** — Purpose-built for hierarchical trees
- **Clean Interface** — Minimal UI, maximum focus

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Build for Production

```bash
npm run build
```

## Switching Between Implementations

You can toggle between react-d3-tree and React Flow versions by editing `src/main.jsx`:

```javascript
// Line 9 in src/main.jsx
const USE_REACT_FLOW = true;  // Switch to React Flow
const USE_REACT_FLOW = false; // Switch to react-d3-tree
```

Save the file and the dev server will automatically reload with the selected version.

### Which Version Should I Use?

**Use react-d3-tree if:**

- You want a simpler, cleaner interface
- Smaller bundle size is important
- You primarily view small to medium trees

**Use React Flow if:**

- You need professional controls and minimap
- You'll be exploring very large trees (500+ nodes)
- You want the best performance and UX features

## Using the GEDCOM Data

The tree loads family data from `public/family.ged` (4,915 individuals). To use your own GEDCOM file:

1. Export GEDCOM from your genealogy software
2. Replace `public/family.ged` with your file
3. Update user configuration in `src/App.jsx` (line 9-13):

```javascript
const userConfig = {
  your_key: { name: 'Your Full Name', label: 'Your Display Name' },
  // Add more users as needed
};
```

## Deployment

### Deploy to Railway

1. Push this code to a GitHub repository
2. Go to [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect the configuration and deploy

The app will be available at `https://your-project.up.railway.app`

### Environment Variables

No environment variables are required for basic deployment.

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool
- **Tailwind CSS 3.4** — Styling
- **react-d3-tree 3** — Tree visualization (default)
- **React Flow 11** — Advanced graph visualization (optional)
- **dagre** — Tree layout algorithm
- **Railway** — Hosting

## Project Structure

```text
powell-tree/
├── public/
│   ├── family.ged           # GEDCOM data (4,915 individuals)
│   └── tree.svg             # Favicon
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx    # Search functionality
│   │   ├── Breadcrumbs.jsx  # Ancestry path navigation
│   │   └── GenerationControl.jsx  # Depth control
│   ├── App.jsx              # react-d3-tree implementation
│   ├── AppReactFlow.jsx     # React Flow implementation
│   ├── gedcomParser.js      # GEDCOM parsing utilities
│   ├── main.jsx             # Entry point (toggle versions here)
│   └── index.css            # Global styles
├── docs/
│   ├── REACT_FLOW_VS_D3_TREE.md        # Comparison guide
│   ├── TESTING_BOTH_IMPLEMENTATIONS.md # Testing guide
│   └── SESSION_HANDOFF_HORIZONTAL_TREE.md # Implementation notes
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite config
├── tailwind.config.js       # Tailwind config
├── postcss.config.js        # PostCSS config
└── railway.json             # Railway deployment config
```

## License

MIT License - feel free to use this for your own family tree!
