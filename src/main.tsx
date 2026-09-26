import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/dm-serif-display/latin-400.css'
import '@fontsource-variable/inter/wght.css'
import './index.css'
import App from './App.tsx'
import { PhonePreview } from './components/PhonePreview'

document.documentElement.classList.toggle('framed-app', new URLSearchParams(window.location.search).get('framed') === '1' && window.self !== window.top)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {new URLSearchParams(window.location.search).get('phone') === '1' ? <PhonePreview /> : <App />}
  </StrictMode>,
)
