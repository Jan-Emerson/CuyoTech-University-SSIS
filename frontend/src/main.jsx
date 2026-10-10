import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Version key — bumping this clears stale localStorage from old sessions
const APP_VERSION = 'ssis-v3';
if (localStorage.getItem('ssis_app_version') !== APP_VERSION) {
  localStorage.clear();
  localStorage.setItem('ssis_app_version', APP_VERSION);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
