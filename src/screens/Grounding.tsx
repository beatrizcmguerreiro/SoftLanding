import { useEffect, useRef, useState } from 'react'
import type { GroundingExperience } from '../../shared/grounding.mjs'
import { Companion } from '../components/Companion'
import { useNarration } from '../lib/narration'

const CLOSING_LINE = 'The thought can still be there. And so can you.'

type Props = {
  experience: GroundingExperience
  suggestion?: string | null
  onClose: () => void
  step: number
  setStep: (step: number) => void
}

export function Grounding({ experience, suggestion, onClose, step, setStep }: Props) {
  const invitation = useRef<HTMLHeadingElement>(null)
  const keys = ['touch', 'see', 'hear'] as const
  const done = step === keys.length
  const [voice, setVoice] = useState(true)
  const line = done ? CLOSING_LINE : experience.grounding[keys[step]]
  const speaking = useNarration(line, voice)
  useEffect(() => { invitation.current?.focus() }, [step])
  return (
    <section className={`grounding-scene${done ? ' grounding-scene--done' : ''}`} aria-label="A grounding moment">
      <div className="scene-light" aria-hidden="true" />
      <p className="scene-recognition">{experience.recognition}</p>
      <Companion expression="attentive" />
      <div className="invitation-stage">
        <div className={`sensory-symbol${speaking ? ' is-speaking' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 80 80" fill="none">
            {step === 0 ? <><path d="M25 48V30a5 5 0 0 1 10 0v10-19a5 5 0 0 1 10 0v19-13a5 5 0 0 1 10 0v15-7a5 5 0 0 1 10 0v16c0 15-9 22-21 22-9 0-14-4-19-11L14 46c-4-6 3-11 7-6l4 8Z" /></> : step === 1 ? <><path d="M8 40s12-19 32-19 32 19 32 19-12 19-32 19S8 40 8 40Z" /><circle cx="40" cy="40" r="9" /></> : step === 2 ? <><path d="M29 47c0 18 17 23 21 5 2-8 13-10 13-23a23 23 0 0 0-46 0M30 32c0-17 22-17 22-1 0 9-13 9-13 18" /></> : <><path d="M15 50c12-22 38-22 50 0M23 58c8-13 26-13 34 0" /><circle cx="40" cy="23" r="7" /></>}
          </svg>
        </div>
        <h1 className="invitation-text" ref={invitation} tabIndex={-1} key={step}>
          {done ? CLOSING_LINE : line.split(/(?<=[.!?])\s+/).map((sentence, index) => <span className="invitation-paragraph" key={index}>{sentence}</span>)}
        </h1>
        <button className="scene-voice" type="button" aria-pressed={voice} aria-label={voice ? 'Turn the voice off' : 'Turn the voice on'}
          onClick={() => setVoice(!voice)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
            {voice ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" /> : <path d="m16 9.5 5 5m0-5-5 5" />}
          </svg>
        </button>
        {done && suggestion && (
          <p className="scene-suggestion">
            <span className="scene-suggestion__eyebrow">One thing you could do</span>
            {suggestion}
          </p>
        )}
        <div className="grounding-controls">
          {done ? <button className="btn btn--primary" onClick={onClose}>Close</button> : <>
            <button className="btn btn--comfort" onClick={() => setStep(step + 1)}>Guide me on!</button>
            <div className="grounding-secondary">
              <button className="btn btn--secondary" onClick={() => setStep(keys.length)}>Skip for now</button>
            </div>
          </>}
        </div>
      </div>
    </section>
  )
}
