import { useCallback, useEffect, useRef, useState } from 'react'
import type { Analysis, AnalysisSource, AppState, SupportReason } from './lib/types'
import { analyzeThoughts, fetchAiAvailable } from './lib/analysis'
import { mentionsNewOrWorseningSymptoms, needsHumanSupport } from './lib/safety'
import { HelpDialog } from './components/HelpDialog'
import { Welcome } from './screens/Welcome'
import { Write } from './screens/Write'
import { Organizing } from './screens/Organizing'
import { Organized } from './screens/Organized'
import { Grounding } from './screens/Grounding'
import { Finished } from './screens/Finished'
import { HumanSupport } from './screens/HumanSupport'

const ORGANIZE_MIN_MS = 800
const SLOW_NOTICE_MS = 1500

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export default function App() {
  const [state, setState] = useState<AppState>('welcome')
  const [text, setText] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [source, setSource] = useState<AnalysisSource>('local')
  const [supportReason, setSupportReason] = useState<SupportReason>('urgent')
  const [aiAvailable, setAiAvailable] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [slow, setSlow] = useState(false)
  const [liveMessage, setLiveMessage] = useState('')
  const run = useRef(0)

  useEffect(() => {
    fetchAiAvailable().then(setAiAvailable)
  }, [])

  const announce = useCallback((message: string) => {
    setLiveMessage('')
    requestAnimationFrame(() => setLiveMessage(message))
  }, [])

  const reset = useCallback(() => {
    run.current += 1
    setText('')
    setAnalysis(null)
    setSlow(false)
  }, [])

  const organize = useCallback(async () => {
    const current = text.trim()
    if (!current) return

    if (needsHumanSupport(current)) {
      setSupportReason('urgent')
      reset()
      setState('human-support')
      return
    }
    if (mentionsNewOrWorseningSymptoms(current)) {
      setSupportReason('symptoms')
      reset()
      setState('human-support')
      return
    }

    const id = ++run.current
    setState('organizing')
    setSlow(false)
    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_NOTICE_MS)
    const minDelay = new Promise((r) => setTimeout(r, prefersReducedMotion() ? 0 : ORGANIZE_MIN_MS))

    const [result] = await Promise.all([analyzeThoughts(current, { useAi: aiAvailable }), minDelay])
    window.clearTimeout(slowTimer)
    if (id !== run.current) return

    if (result.analysis.human_support) {
      setSupportReason('urgent')
      reset()
      setState('human-support')
      return
    }

    setAnalysis(result.analysis)
    setSource(result.source)
    setState('organized')
    announce('Os pensamentos foram organizados em duas áreas: Posso fazer e Ainda não posso saber.')
  }, [text, aiAvailable, reset, announce])

  const finish = () => {
    reset()
    setState('finished')
  }

  const restart = () => {
    reset()
    setState('welcome')
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="wordmark">SoftLanding</span>
        {state !== 'human-support' && (
          <button type="button" className="link link--small" onClick={() => setHelpOpen(true)}>
            Ajuda agora
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
            onSubmit={organize}
            onBack={() => setState('welcome')}
          />
        )}
        {state === 'organizing' && <Organizing text={text} slow={slow} />}
        {state === 'organized' && analysis && (
          <Organized
            analysis={analysis}
            source={source}
            aiAvailable={aiAvailable}
            announce={announce}
            onExit={() => {
              reset()
              setState('grounding')
            }}
          />
        )}
        {state === 'grounding' && <Grounding onClose={finish} onHelp={() => setHelpOpen(true)} />}
        {state === 'finished' && <Finished onRestart={restart} />}
        {state === 'human-support' && <HumanSupport reason={supportReason} onRestart={restart} />}
      </main>

      <div className="visually-hidden" aria-live="polite" role="status">
        {liveMessage}
      </div>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
