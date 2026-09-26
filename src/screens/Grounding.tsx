import { useEffect, useState } from 'react'
import { useFocusOnMount } from '../components/useFocusOnMount'

type Props = {
  onClose: () => void
  onHelp: () => void
}

export function Grounding({ onClose, onHelp }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 4000)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <section className="screen screen--center" aria-labelledby="grounding-title">
      <h1 id="grounding-title" className="title title--display" ref={heading} tabIndex={-1}>
        You still don’t have the answer. And you can be here, now.
      </h1>

      <div className="card card--tilt">
        <div className="dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="card__text">Notice three things you can see around you.</p>
      </div>

      <p className={`soft-note${ready ? ' is-visible' : ''}`} aria-live="polite">
        {ready ? 'You can close this for now.' : ''}
      </p>

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Close
        </button>
        <button type="button" className="link" onClick={onHelp}>
          I need human support
        </button>
      </div>
    </section>
  )
}
