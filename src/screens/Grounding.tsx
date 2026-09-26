import { useEffect, useRef, useState } from 'react'
import type { GroundingContent } from '../lib/types'
import { CLOSING_LINE, INVITATION_ORDER } from '../lib/grounding'
import { useFocusOnMount } from '../components/useFocusOnMount'

const WAITING = 'Taking a moment with what you wrote…'

type Props = {
  content: GroundingContent | null
  slow: boolean
  onClose: () => void
  onHelp: () => void
}

export function Grounding({ content, slow, onClose, onHelp }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  const closeButton = useRef<HTMLButtonElement>(null)
  const [step, setStep] = useState(0)
  const done = step >= INVITATION_ORDER.length

  useEffect(() => {
    if (content) heading.current?.focus()
  }, [content, heading])

  useEffect(() => {
    if (done) closeButton.current?.focus()
  }, [done])

  const next = () => setStep((s) => s + 1)

  return (
    <section className="screen screen--center grounding" aria-labelledby="grounding-title" aria-busy={!content}>
      <div className="scene">
        <div className="scene__light" aria-hidden="true" />
        {content && (
          <p className="balloon balloon--unknown scene__balloon">
            <span className="visually-hidden">Your thought: </span>
            <span className="balloon__text">{content.thought_label}</span>
          </p>
        )}
      </div>

      <h1
        id="grounding-title"
        className={content ? 'title grounding__recognition' : 'visually-hidden'}
        ref={heading}
        tabIndex={-1}
      >
        {content ? content.recognition : WAITING}
      </h1>

      <div className="invitation-slot" aria-live="polite">
        {!content ? (
          <p className="invitation invitation--waiting" aria-hidden="true">
            {WAITING}
          </p>
        ) : done ? (
          <p key="closing" className="invitation invitation--closing">
            {CLOSING_LINE}
          </p>
        ) : (
          <p key={step} className={`invitation${step === 0 ? ' invitation--first' : ''}`}>
            {content.grounding[INVITATION_ORDER[step]]}
          </p>
        )}
      </div>

      {!content && slow && <p className="fineprint">Still here. This can take a few seconds.</p>}

      {content && (
        <div className="actions">
          {done ? (
            <button ref={closeButton} type="button" className="btn btn--primary" onClick={onClose}>
              Close
            </button>
          ) : (
            <>
              <button type="button" className="btn btn--primary" onClick={next}>
                Continue
              </button>
              <button type="button" className="link" onClick={next}>
                Skip
              </button>
            </>
          )}
          <button type="button" className="link link--small" onClick={onHelp}>
            I need human support
          </button>
        </div>
      )}
    </section>
  )
}
