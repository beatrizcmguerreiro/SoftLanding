import { useRef, useState } from 'react'
import { fallbackGrounding, validateGrounding, type GroundingExperience } from '../shared/grounding.mjs'
import { needsHumanSupport, mentionsNewOrWorseningSymptoms } from './lib/safety'
import { HelpDialog } from './components/HelpDialog'
import { Welcome } from './screens/Welcome'
import { Feeling } from './screens/Feeling'
import { Write } from './screens/Write'
import { Grounding } from './screens/Grounding'
import { HumanSupport } from './screens/HumanSupport'
import type { SupportReason } from './lib/types'

export default function App() {
  const [screen, setScreen] = useState<'welcome' | 'feeling' | 'write' | 'grounding' | 'support'>('welcome')
  const [feeling, setFeeling] = useState('Unsure')
  const [text, setText] = useState('')
  const [experience, setExperience] = useState<GroundingExperience | null>(null)
  const [groundingStep, setGroundingStep] = useState(0)
  const [support, setSupport] = useState<SupportReason>('urgent')
  const [helpOpen, setHelpOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const request = useRef<AbortController | null>(null)

  const reset = () => {
    request.current?.abort()
    request.current = null
    setText('')
    setFeeling('Unsure')
    setExperience(null)
    setBusy(false)
    setScreen('welcome')
  }
  const showSupport = (reason: SupportReason) => {
    setSupport(reason)
    setText('')
    setFeeling('Unsure')
    setExperience(null)
    setBusy(false)
    setScreen('support')
  }
  const submit = async () => {
    if (busy || !text.trim()) return
    const original = text.trim()
    if (needsHumanSupport(original)) return showSupport('urgent')
    if (mentionsNewOrWorseningSymptoms(original)) return showSupport('symptoms')
    setBusy(true)
    const controller = new AbortController()
    request.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 10000)
    let next = fallbackGrounding(original)
    try {
      const response = await fetch('/api/grounding', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: original }), signal: controller.signal,
      })
      if (response.ok) {
        const data = await response.json()
        if (request.current !== controller) return
        if (data.support === 'urgent' || data.support === 'symptoms') return showSupport(data.support)
        next = validateGrounding(data.experience, original) ?? next
      }
    } catch { /* Offline and invalid responses use the predefined sensory invitations. */ }
    finally { window.clearTimeout(timeout) }
    if (request.current !== controller) return
    request.current = null
    setExperience(next)
    setGroundingStep(0)
    setBusy(false)
    setScreen('grounding')
  }
  return (
    <div className="app">
      <header className="topbar">
        {screen !== 'write' && screen !== 'grounding' && screen !== 'feeling' && <span className="wordmark">SoftLanding<span className="wordmark__dot">.</span></span>}
        {(screen === 'write' || screen === 'grounding' || screen === 'feeling') && <button className="topbar__back" type="button" aria-label="Go back" disabled={busy} onClick={() => {
          if (screen === 'feeling') setScreen('welcome')
          else if (screen === 'write') setScreen('feeling')
          else if (groundingStep > 0) setGroundingStep(groundingStep - 1)
          else setScreen('write')
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m14 6-6 6 6 6M8 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>}
      </header>
      <main className="main" key={screen}>
        {screen === 'welcome' && <Welcome onStart={() => setScreen('feeling')} onHelp={() => setHelpOpen(true)} />}
        {screen === 'feeling' && <Feeling value={feeling} onChange={setFeeling} onContinue={() => setScreen('write')} />}
        {screen === 'write' && <Write text={text} onChange={setText} onSubmit={submit} onSkip={() => {
          setText('')
          setExperience(fallbackGrounding(''))
          setGroundingStep(0)
          setScreen('grounding')
        }} busy={busy} />}
        {screen === 'grounding' && experience && <Grounding experience={experience} onClose={reset} step={groundingStep} setStep={setGroundingStep} />}
        {screen === 'support' && <HumanSupport reason={support} onRestart={reset} />}
      </main>
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

