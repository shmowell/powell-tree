# 🌳 Family Tree

An interactive family tree website to explore and visualize your family heritage.

![Family Tree Preview](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-cyan)

## Features

- **Interactive Navigation** — Expand and collapse family branches
- **Person Details** — Click any family member to view their information
- **Spouse Connections** — Visual links between married couples
- **Living/Deceased Indicators** — Clear visual distinction
- **Zoom Controls** — Scale the tree from 50% to 150%
- **Responsive Design** — Works on desktop and mobile

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

## Customizing Your Family Tree

Edit the `familyData` object in `src/App.jsx` to add your own family members:

```javascript
const familyData = {
  id: 1,
  name: "Your Ancestor Name",
  birth: "1900",
  death: "1980",  // Optional - remove for living people
  photo: "👴",    // Use emoji or image URL
  spouse: {
    name: "Spouse Name",
    birth: "1905",
    photo: "👵"
  },
  children: [
    // Add children here with the same structure
  ]
};
```

### Photo Options

- Use emojis: `"👨"`, `"👩"`, `"👴"`, `"👵"`, `"👦"`, `"👧"`
- Use image URLs for real photos (update the component to render `<img>` tags)

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
- **Railway** — Hosting

## Project Structure

```
family-tree-app/
├── public/
│   └── tree.svg          # Favicon
├── src/
│   ├── App.jsx           # Main component
│   ├── main.jsx          # Entry point
│   └── index.css         # Styles
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite config
├── tailwind.config.js    # Tailwind config
├── postcss.config.js     # PostCSS config
└── railway.json          # Railway config
```

## License

MIT License - feel free to use this for your own family tree!
