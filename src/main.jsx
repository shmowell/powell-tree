import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppReactFlow from './AppReactFlow.jsx'
import './index.css'

// Toggle between implementations
// Change USE_REACT_FLOW to true to test the React Flow version
const USE_REACT_FLOW = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {USE_REACT_FLOW ? <AppReactFlow /> : <App />}
  </React.StrictMode>,
)
