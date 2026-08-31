import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log(
  `%c╔══════════════════════════════════════════════╗\n║  🎮 ACM SNIoE Website                        ║\n║  Architected by dionysus2359                 ║\n║                                              ║\n║  Let's connect:                              ║\n║  linkedin.com/in/om-tiwari-240817247         ║\n╚══════════════════════════════════════════════╝`,
  'color: #ff5ea6; font-weight: bold; font-family: monospace; font-size: 14px;'
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
