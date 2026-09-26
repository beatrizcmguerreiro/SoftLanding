import { useRef, useState } from 'react'


export function ThoughtDeck({ text, onChange, disabled, error, describedBy, onDictate, listening, transcribing, busy }: {
  text: string; onChange: (text: string) => void; disabled: boolean; error: boolean; describedBy: string
  onDictate: () => void; listening: boolean; transcribing: boolean; busy: boolean
}) {
  const [editing, setEditing] = useState(false)
  const input = useRef<HTMLTextAreaElement>(null)
  return (
    <div className="thought-deck" role="group" aria-label="Choose or write a thought">
      <div className="thought-deck__stack" aria-hidden="true" />
      <article className={`thought-deck__card${editing ? ' is-editing' : ''}`} style={{ transform: `rotate(${editing ? 0 : 4}deg)` }} onClick={() => input.current?.focus()}>
        <div className="thought-deck__header">
          <span className="thought-deck__eyebrow">{listening ? 'Listening…' : transcribing ? 'Writing your words…' : 'Write your worries'}</span>
          <button className={`thought-deck__mic${transcribing ? ' is-transcribing' : ''}`} type="button" disabled={busy || transcribing}
            aria-label={listening ? 'Stop dictation' : 'Use my voice'} aria-pressed={listening}
            onMouseDown={event => event.preventDefault()}
            onClick={event => { event.stopPropagation(); onDictate() }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3M8 22h8" />
            </svg>
          </button>
        </div>
        {!editing && text && <p className="thought-deck__phrase" aria-hidden="true">{text}</p>}
        <textarea ref={input} id="thoughts" className={`thought-deck__input${editing || !text ? '' : ' visually-hidden'}`} value={text} maxLength={600}
          readOnly={!editing && !!text} disabled={disabled} aria-invalid={error || undefined} aria-describedby={describedBy}
          onFocus={() => setEditing(true)} onBlur={() => setEditing(false)} onChange={event => onChange(event.target.value)} />
      </article>
    </div>
  )
}


