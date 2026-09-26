import { useEffect, useRef } from 'react'
import type { GroundingExperience } from '../../shared/grounding.mjs'
import { Companion } from '../components/Companion'

export function Grounding({ experience, originalText, onClose, step, setStep }: { experience: GroundingExperience; originalText: string; onClose: () => void; step: number; setStep: (step: number) => void }) {
  const invitation = useRef<HTMLHeadingElement>(null)
  const keys = ['touch', 'see', 'hear'] as const
  const done = step === keys.length
  useEffect(() => { invitation.current?.focus() }, [step])
  return (
    <section className={`grounding-scene${done ? ' grounding-scene--done' : ''}${originalText.length > 300 ? ' grounding-scene--long' : ''}`} aria-label="A grounding moment">
      <div className="scene-light" aria-hidden="true" />
      <p className="scene-recognition">{experience.recognition}</p>
      <Companion expression="attentive" />
      {originalText && <div className="thought-cloud"><span>{originalText}</span></div>}
      <div className="invitation-stage">
        <div className="sensory-symbol" aria-hidden="true">
          <svg viewBox="0 0 80 80" fill="none">
            {step === 0 ? <><path d="M25 48V30a5 5 0 0 1 10 0v10-19a5 5 0 0 1 10 0v19-13a5 5 0 0 1 10 0v15-7a5 5 0 0 1 10 0v16c0 15-9 22-21 22-9 0-14-4-19-11L14 46c-4-6 3-11 7-6l4 8Z" /></> : step === 1 ? <><path d="M8 40s12-19 32-19 32 19 32 19-12 19-32 19S8 40 8 40Z" /><circle cx="40" cy="40" r="9" /></> : step === 2 ? <><path d="M29 47c0 18 17 23 21 5 2-8 13-10 13-23a23 23 0 0 0-46 0M30 32c0-17 22-17 22-1 0 9-13 9-13 18" /></> : <><path d="M15 50c12-22 38-22 50 0M23 58c8-13 26-13 34 0" /><circle cx="40" cy="23" r="7" /></>}
          </svg>
        </div>
        <h1 className="invitation-text" ref={invitation} tabIndex={-1} key={step}>
          {done ? 'The thought can still be there. And so can you.' : experience.grounding[keys[step]]}
        </h1>
        <div className="grounding-controls">
          {done ? <button className="btn btn--primary" onClick={onClose}>Close</button> : <>
            <button className="btn btn--comfort" onClick={() => setStep(keys.length)}>I feel better</button>
            <div className="grounding-secondary">
              <button className="btn btn--secondary" onClick={() => setStep(step + 1)}>Skip</button>
            </div>
          </>}
        </div>
      </div>
    </section>
  )
}
