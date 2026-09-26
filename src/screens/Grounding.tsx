import { useEffect, useRef, useState } from 'react'
import type { GroundingExperience } from '../../shared/grounding.mjs'
import { Companion } from '../components/Companion'

const AFTER = ['A little lighter', 'About the same', 'Not sure'] as const
type After = (typeof AFTER)[number]

export function Grounding({ experience, onClose, step, setStep }: { experience: GroundingExperience; onClose: () => void; step: number; setStep: (step: number) => void }) {
  const invitation = useRef<HTMLHeadingElement>(null)
  const keys = ['touch', 'see', 'hear'] as const
  const done = step === keys.length
  const [after, setAfter] = useState<After | null>(null)
  useEffect(() => { invitation.current?.focus() }, [step])
  const chooseAfter = (option: After) => setAfter(option)
  const replay = () => {
    setAfter(null)
    setStep(0)
  }
  return (
    <section className={`grounding-scene${done ? ' grounding-scene--done' : ''}`} aria-label="A grounding moment">
      <div className="scene-light" aria-hidden="true" />
      <p className="scene-recognition">{done ? 'Take a moment before you move on.' : "Let's find somewhere soft to land."}</p>
      <Companion expression="attentive" />
      <div className="invitation-stage">
        <div className="sensory-symbol" aria-hidden="true">
          <svg viewBox="0 0 80 80" fill="none">
            {step === 0 ? <><path d="M25 48V30a5 5 0 0 1 10 0v10-19a5 5 0 0 1 10 0v19-13a5 5 0 0 1 10 0v15-7a5 5 0 0 1 10 0v16c0 15-9 22-21 22-9 0-14-4-19-11L14 46c-4-6 3-11 7-6l4 8Z" /></> : step === 1 ? <><path d="M8 40s12-19 32-19 32 19 32 19-12 19-32 19S8 40 8 40Z" /><circle cx="40" cy="40" r="9" /></> : step === 2 ? <><path d="M29 47c0 18 17 23 21 5 2-8 13-10 13-23a23 23 0 0 0-46 0M30 32c0-17 22-17 22-1 0 9-13 9-13 18" /></> : <><path d="M15 50c12-22 38-22 50 0M23 58c8-13 26-13 34 0" /><circle cx="40" cy="23" r="7" /></>}
          </svg>
        </div>
        <h1 className="invitation-text" ref={invitation} tabIndex={-1} key={step}>
          {done ? 'The thought can still be there. And so can you.' : experience.grounding[keys[step]].split(/(?<=[.!?])\s+/).map((sentence, index) => <span className="invitation-paragraph" key={index}>{sentence}</span>)}
        </h1>
        {done && (
          <div className="closing-checkin">
            <p id="closing-feeling" className="closing-checkin__prompt">How are you feeling now?</p>
            <div className="closing-checkin__options" role="radiogroup" aria-labelledby="closing-feeling">
              {AFTER.map((option, index) => (
                <span className="closing-checkin__choice" key={option}>
                  {index > 0 && <span className="closing-checkin__dot" aria-hidden="true">·</span>}
                  <button type="button" role="radio" className="closing-checkin__option" aria-checked={after === option}
                    tabIndex={after === option || (after === null && index === 0) ? 0 : -1}
                    onClick={() => chooseAfter(option)}
                    onKeyDown={event => {
                      const next = event.key === 'ArrowRight' ? (index + 1) % AFTER.length : event.key === 'ArrowLeft' ? (index + AFTER.length - 1) % AFTER.length : null
                      if (next === null) return
                      event.preventDefault()
                      chooseAfter(AFTER[next])
                      const choice = event.currentTarget.parentElement?.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]
                      choice?.focus()
                    }}>
                    {option}
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="grounding-controls">
          {done ? <>
            <button type="button" className="closing-again" onClick={replay}>Try another grounding moment</button>
            <button type="button" className="btn btn--primary" onClick={onClose}>Back to home.</button>
          </> : <>
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
