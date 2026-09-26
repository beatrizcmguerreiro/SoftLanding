import { useState, type FormEvent } from 'react'
import { LIMITS } from '../lib/analysis'
import { useFocusOnMount } from '../components/useFocusOnMount'

export const DEMO_TEXT = "What if the result is serious? I don't even know when it arrives and I keep searching."

type Props = {
  text: string
  aiAvailable: boolean
  onChange: (text: string) => void
  onSubmit: () => void
  onBack: () => void
}

export function Write({ text, aiAvailable, onChange, onSubmit, onBack }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  const [error, setError] = useState(false)
  const nearLimit = text.length >= LIMITS.input * 0.8

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      setError(true)
      document.getElementById('thoughts')?.focus()
      return
    }
    onSubmit()
  }

  return (
    <section className="screen" aria-labelledby="write-title">
      <form className="write" onSubmit={submit} noValidate>
        <h1 id="write-title" className="title" ref={heading} tabIndex={-1}>
          <label htmlFor="thoughts">What’s going through your mind?</label>
        </h1>
        <p id="thoughts-help" className="lead lead--left">
          It can be a loose sentence. You don’t need to organise it.
        </p>

        <div className={`field${error ? ' field--error' : ''}`}>
          <textarea
            id="thoughts"
            className="field__input"
            value={text}
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
            <button
              type="button"
              className="link link--small"
              onClick={() => {
                onChange(DEMO_TEXT)
                setError(false)
              }}
            >
              Use example (fictional text)
            </button>
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

        <p className="fineprint fineprint--left">
          {aiAvailable
            ? 'When you continue, your text is sent to an external AI service (Anthropic) only to be organised. We don’t store it. In this demo, use fictional text.'
            : 'Your text is organised on this device and is not sent or stored.'}
        </p>

        <div className="actions">
          <button type="submit" className="btn btn--primary">
            Make space for these thoughts
          </button>
          <button type="button" className="link" onClick={onBack}>
            Back
          </button>
        </div>
      </form>
    </section>
  )
}
