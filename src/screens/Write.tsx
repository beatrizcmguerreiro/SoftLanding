import { useRef, useState, type FormEvent } from 'react'
import { ThoughtDeck } from '../components/ThoughtDeck'
import { LIMITS } from '../lib/analysis'
import { useDictation } from '../lib/useDictation'
import { useFocusOnMount } from '../components/useFocusOnMount'

export const DEMO_TEXT = "What if the result is serious? I don't even know when it arrives and I keep searching."
const EXAMPLES = [DEMO_TEXT, 'Waiting is taking up so much space in my head.', 'I keep searching, but it isn’t helping me switch off.', 'My thoughts keep jumping ahead.', 'I’m finding it hard to focus on what’s in front of me.']

type Props = {
  text: string
  busy: boolean
  onChange: (text: string) => void
  onSubmit: () => void
  onSkip: () => void
}

export function Write({ text, busy, onChange, onSubmit, onSkip }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  const [error, setError] = useState(false)
  const exampleIndex = useRef(0)
  const { listening, transcribing, message: speechMessage, toggle: dictate } = useDictation(value => {
    onChange(value)
    if (value.trim()) setError(false)
  })
  const nearLimit = text.length >= LIMITS.input * 0.8

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (busy || listening || transcribing) return
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
          <ThoughtDeck text={text} disabled={busy || listening || transcribing} error={error}
            onDictate={dictate} listening={listening} transcribing={transcribing} busy={busy}
            describedBy={`thoughts-help${error ? ' thoughts-error' : ''}${nearLimit ? ' thoughts-count' : ''}`}
            onChange={value => { onChange(value); if (value.trim()) setError(false) }} />
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
          <button type="button" className="btn btn--secondary" disabled={busy || listening || transcribing} onClick={() => {
            onChange(EXAMPLES[exampleIndex.current])
            exampleIndex.current = (exampleIndex.current + 1) % EXAMPLES.length
            setError(false)
          }}>Use example</button>
        </div>
        <p className="visually-hidden" role="status">{listening ? 'Listening…' : transcribing ? 'Writing down your words…' : speechMessage}</p>

        <p className="fineprint fineprint--left">
          {speechMessage || 'Your words aren’t saved by SoftLanding. Dictation sends the recording to ElevenLabs to be written down.'}
        </p>

        <div className="actions">
          <button type="submit" className="btn btn--primary" disabled={busy || listening || transcribing}>
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

