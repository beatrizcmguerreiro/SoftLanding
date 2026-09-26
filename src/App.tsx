import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppState, GroundingContent, SupportReason } from './lib/types'
import { fetchAiAvailable, requestGrounding } from './lib/grounding'
import { supportReason as detectSupportReason } from './lib/safety'
import { HelpDialog } from './components/HelpDialog'
import { Welcome } from './screens/Welcome'
import { Write } from './screens/Write'
import { Grounding } from './screens/Grounding'
import { HumanSupport } from './screens/HumanSupport'

const MIN_WAIT_MS = 800
const SLOW_NOTICE_MS = 1500

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export default function App() {
  const [state, setState] = useState<AppState>('welcome')
  const [text, setText] = useState('')
  const [content, setContent] = useState<GroundingContent | null>(null)
  const [supportReason, setSupportReason] = useState<SupportReason>('urgent')
  const [aiAvailable, setAiAvailable] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [slow, setSlow] = useState(false)
  const run = useRef(0)

  useEffect(() => {
    fetchAiAvailable().then(setAiAvailable)
  }, [])

  const reset = useCallback(() => {
    run.current += 1
    setText('')
    setContent(null)
    setSlow(false)
  }, [])

  const showSupport = useCallback(
    (reason: SupportReason) => {
      setSupportReason(reason)
      reset()
      setState('human-support')
    },
    [reset],
  )

  const submit = useCallback(async () => {
    const current = text.trim()
    if (!current) return

    const reason = detectSupportReason(current)
    if (reason) return showSupport(reason)

    const id = ++run.current
    setText('')
    setContent(null)
    setSlow(false)
    setState('grounding')
    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_NOTICE_MS)
    const minDelay = new Promise((r) => setTimeout(r, prefersReducedMotion() ? 0 : MIN_WAIT_MS))

    const [result] = await Promise.all([requestGrounding(current, { useAi: aiAvailable }), minDelay])
    window.clearTimeout(slowTimer)
    if (id !== run.current) return

    if (result.kind === 'support') return showSupport(result.reason)
    setSlow(false)
    setContent(result.content)
  }, [text, aiAvailable, showSupport])

  const restart = () => {
    reset()
    setState('welcome')
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="wordmark">SoftLanding</span>
        {state === 'write' && (
          <button type="button" className="link link--small" onClick={() => setHelpOpen(true)}>
            Help now
          </button>
        )}
      </header>

      <main className="main" key={state}>
        {state === 'welcome' && <Welcome onStart={() => setState('write')} onHelp={() => setHelpOpen(true)} />}
        {state === 'write' && (
          <Write
            text={text}
            aiAvailable={aiAvailable}
            onChange={setText}
            onSubmit={submit}
            onBack={() => setState('welcome')}
          />
        )}
        {state === 'grounding' && (
          <Grounding content={content} slow={slow} onClose={restart} onHelp={() => setHelpOpen(true)} />
        )}
        {state === 'human-support' && <HumanSupport reason={supportReason} onRestart={restart} />}
      </main>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
