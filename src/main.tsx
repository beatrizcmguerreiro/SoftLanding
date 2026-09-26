import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/dm-serif-display/latin-400.css'
import '@fontsource-variable/inter/wght.css'
import './index.css'
import App from './App.tsx'
import { PhonePreview } from './components/PhonePreview'

const params = new URLSearchParams(window.location.search)
const framed = params.get('framed') === '1' && window.self !== window.top
document.documentElement.classList.toggle('framed-app', framed)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {framed || params.get('plain') === '1' ? <App /> : <PhonePreview />}
  </StrictMode>,
)
