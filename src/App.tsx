import { useRef, useState } from 'react'
import { fallbackGrounding, validateGrounding, type GroundingExperience } from '../shared/grounding.mjs'
import { needsHumanSupport, mentionsNewOrWorseningSymptoms } from './lib/safety'
import { HelpDialog } from './components/HelpDialog'
import { Welcome } from './screens/Welcome'
import { Write } from './screens/Write'
import { Grounding } from './screens/Grounding'
import { HumanSupport } from './screens/HumanSupport'
import type { SupportReason } from './lib/types'

export default function App() {
  const [screen, setScreen] = useState<'welcome' | 'write' | 'grounding' | 'support'>('welcome')
  const [text, setText] = useState('')
  const [experience, setExperience] = useState<GroundingExperience | null>(null)
  const [support, setSupport] = useState<SupportReason>('urgent')
  const [helpOpen, setHelpOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const request = useRef<AbortController | null>(null)

  const reset = () => {
    request.current?.abort()
    request.current = null
    setText('')
    setExperience(null)
    setBusy(false)
    setScreen('welcome')
  }
  const showSupport = (reason: SupportReason) => {
    setSupport(reason)
    setText('')
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
    setBusy(false)
    setScreen('grounding')
  }
  return (
    <div className="app">
      <header className="topbar">
        <span className="wordmark">SoftLanding<span className="wordmark__dot">.</span></span>
      </header>
      <main className="main" key={screen}>
        {screen === 'welcome' && <Welcome onStart={() => setScreen('write')} onHelp={() => setHelpOpen(true)} />}
        {screen === 'write' && <Write text={text} onChange={setText} onSubmit={submit} onSkip={() => {
          setText('')
          setExperience(fallbackGrounding(''))
          setScreen('grounding')
        }} busy={busy} />}
        {screen === 'grounding' && experience && <Grounding experience={experience} onClose={reset} onBack={() => setScreen('write')} />}
        {screen === 'support' && <HumanSupport reason={support} onRestart={reset} />}
      </main>
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
