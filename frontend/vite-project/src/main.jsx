import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
// Keep Render backend awake — ping every 14 minutes
setInterval(() => {
  fetch("https://servenow-m4ob.onrender.com/api/health")
    .catch(() => {}); // silent fail
}, 14 * 60 * 1000);