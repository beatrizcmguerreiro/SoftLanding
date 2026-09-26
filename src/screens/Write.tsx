import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LIMITS } from '../lib/analysis'
import { useFocusOnMount } from '../components/useFocusOnMount'

export const DEMO_TEXT = "What if the result is serious? I don't even know when it arrives and I keep searching."

type Props = {
  text: string
  busy: boolean
  onChange: (text: string) => void
  onSubmit: () => void
  onSkip: () => void
}

type Dictation = {
  lang: string; continuous: boolean; interimResults: boolean
  start: () => void; stop: () => void; abort: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null; onend: (() => void) | null
}
type SpeechWindow = Window & { SpeechRecognition?: new () => Dictation; webkitSpeechRecognition?: new () => Dictation }

export function Write({ text, busy, onChange, onSubmit, onSkip }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  const [error, setError] = useState(false)
  const [listening, setListening] = useState(false)
  const [speechMessage, setSpeechMessage] = useState('')
  const speech = useRef<Dictation | null>(null)
  const Speech = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition
  useEffect(() => () => {
    if (speech.current) {
      speech.current.onresult = null
      speech.current.onerror = null
      speech.current.onend = null
      speech.current.abort()
    }
  }, [])
  const dictate = () => {
    if (listening) { speech.current?.stop(); return }
    if (!Speech) return
    const recognition = new Speech()
    speech.current = recognition
    recognition.lang = 'en-GB'
    recognition.continuous = false
    recognition.interimResults = false
    const before = text.trim()
    recognition.onresult = event => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join(' ')
      onChange([before, transcript].filter(Boolean).join(' ').slice(0, LIMITS.input))
      setError(false)
    }
    recognition.onerror = () => { setListening(false); setSpeechMessage('Dictation couldn’t start. You can type or use your device’s dictation instead.') }
    recognition.onend = () => setListening(false)
    try { recognition.start(); setListening(true); setSpeechMessage('') }
    catch { setSpeechMessage('Dictation isn’t available right now. You can still type.'); setListening(false) }
  }
  const nearLimit = text.length >= LIMITS.input * 0.8

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (busy || listening) return
    if (!text.trim()) {
      setError(true)
      document.getElementById('thoughts')?.focus()
      return
    }
    onSubmit()
  }

  return (
    <section className="screen write-screen" aria-labelledby="write-title">
      <form className="write" onSubmit={submit} noValidate>
        <h1 id="write-title" className="title" ref={heading} tabIndex={-1}>
          <label htmlFor="thoughts">What’s going through your mind?</label>
        </h1>
        <p id="thoughts-help" className="lead lead--left">
          A few words are enough. They don’t have to be perfect.
        </p>

        <div className={`field${error ? ' field--error' : ''}`}>
          <textarea
            id="thoughts"
            className="field__input"
            value={text}
            disabled={busy || listening}
            placeholder="You can begin anywhere…"
            maxLength={LIMITS.input}
            rows={6}
            aria-describedby={`thoughts-help${error ? ' thoughts-error' : ''}${nearLimit ? ' thoughts-count' : ''}`}
            aria-invalid={error || undefined}
            onChange={(e) => {
              onChange(e.target.value)
              if (error && e.target.value.trim()) setError(false)
            }}
          />
          <div className="field__meta">
            {nearLimit && (
              <span id="thoughts-count" className="field__count">
                {text.length}/{LIMITS.input}
              </span>
            )}
          </div>
          {error && (
            <p id="thoughts-error" className="field__error" role="alert">
              Write at least one sentence, even a short one.
            </p>
          )}
        </div>

        <div className="write-tools">
        {Speech ? <button className="btn btn--primary voice-button" type="button" disabled={busy} onClick={dictate} aria-pressed={listening}>
          {listening ? 'Stop dictation' : 'Use my voice'}
        </button> : <p className="dictation-note">You can also use your keyboard’s microphone to dictate.</p>}
          <button type="button" className="btn btn--secondary" disabled={busy || listening} onClick={() => {
            onChange(DEMO_TEXT)
            setError(false)
          }}>Use example</button>
        </div>
        <p className="dictation-note" role="status">{listening ? 'Listening…' : speechMessage}</p>

        <p className="fineprint fineprint--left">
          Your words aren’t saved by SoftLanding.
        </p>

        <div className="actions">
          <button type="submit" className="btn btn--primary" disabled={busy || listening}>
            {busy ? 'Making a little space…' : 'Continue'}
          </button>
          <span className="visually-hidden" role="status">{busy ? 'Preparing your grounding moment.' : ''}</span>
          <button type="button" className="btn btn--secondary" disabled={busy} onClick={onSkip}>
            I’d rather not write
          </button>
        </div>
      </form>
    </section>
  )
}
