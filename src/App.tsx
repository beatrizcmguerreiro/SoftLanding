import { useEffect, useRef, useState } from 'react'
import { fallbackGrounding, validateGrounding, type GroundingExperience } from '../shared/grounding.mjs'
import { acceptSuggestion } from '../shared/organised.mjs'
import { needsHumanSupport, mentionsNewOrWorseningSymptoms } from './lib/safety'
import { onPreviewCommand, previewExperience, readPreview, type PreviewCommand } from './lib/preview'
import { HelpDialog } from './components/HelpDialog'
import { Welcome } from './screens/Welcome'
import { Feeling } from './screens/Feeling'
import { DEMO_TEXT, Write } from './screens/Write'
import { Grounding } from './screens/Grounding'
import { HumanSupport } from './screens/HumanSupport'
import type { SupportReason } from './lib/types'

const preview = readPreview()

export default function App() {
  const [screen, setScreen] = useState(preview.screen ?? 'welcome')
  const [feeling, setFeeling] = useState(preview.feeling ?? 'Unsure')
  const [text, setText] = useState(preview.animate ? '' : preview.text ?? '')
  const [experience, setExperience] = useState<GroundingExperience | null>(preview.screen === 'grounding' ? previewExperience(preview.text) : null)
  const [suggestion, setSuggestion] = useState<string | null>(preview.suggestion ?? null)
  const [groundingStep, setGroundingStep] = useState(preview.step ?? 0)
  const [support, setSupport] = useState<SupportReason>(preview.support ?? 'urgent')
  const [helpOpen, setHelpOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const request = useRef<AbortController | null>(null)
  const typing = useRef<number | null>(null)

  const stopTyping = () => {
    if (typing.current) {
      window.clearInterval(typing.current)
      typing.current = null
    }
  }
  const typeText = (full: string) => {
    stopTyping()
    setText('')
    let index = 0
    typing.current = window.setInterval(() => {
      index += 1
      setText(full.slice(0, index))
      if (index >= full.length) stopTyping()
    }, 45)
  }

  const reset = () => {
    request.current?.abort()
    request.current = null
    stopTyping()
    setText('')
    setFeeling('Unsure')
    setExperience(null)
    setSuggestion(null)
    setGroundingStep(0)
    setBusy(false)
    setScreen('welcome')
  }

  useEffect(() => {
    const apply = (command: PreviewCommand) => {
      if (command.reset) {
        reset()
        return
      }
      if (command.feeling) setFeeling(command.feeling)
      if (command.suggestion !== undefined) setSuggestion(command.suggestion)
      if (command.step !== undefined) setGroundingStep(command.step)
      if (command.support) setSupport(command.support)
      if (command.screen === 'grounding') setExperience(previewExperience(command.text))
      if (command.screen === 'write' && command.animate) typeText(command.text || DEMO_TEXT)
      else if (command.text !== undefined) {
        stopTyping()
        setText(command.text)
      }
      if (command.screen) setScreen(command.screen)
    }
    if (preview.animate && preview.screen === 'write') typeText(preview.text || DEMO_TEXT)
    return onPreviewCommand(apply)
  }, [])
  const showSupport = (reason: SupportReason) => {
    setSupport(reason)
    setText('')
    setFeeling('Unsure')
    setExperience(null)
    setSuggestion(null)
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
    let step: string | null = null
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
        step = acceptSuggestion(data.suggestion)
      }
    } catch { /* Offline and invalid responses use the predefined sensory invitations. */ }
    finally { window.clearTimeout(timeout) }
    if (request.current !== controller) return
    request.current = null
    setExperience(next)
    setSuggestion(step)
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
          setSuggestion(null)
          setGroundingStep(0)
          setScreen('grounding')
        }} busy={busy} />}
        {screen === 'grounding' && experience && <Grounding experience={experience} suggestion={suggestion} onClose={reset} step={groundingStep} setStep={setGroundingStep} />}
        {screen === 'support' && <HumanSupport reason={support} onRestart={reset} />}
      </main>
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

