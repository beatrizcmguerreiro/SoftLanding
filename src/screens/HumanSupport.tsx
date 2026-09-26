import type { SupportReason } from '../lib/types'
import { SupportContacts } from '../components/SupportContacts'
import { useFocusOnMount } from '../components/useFocusOnMount'

type Props = {
  reason: SupportReason
  onRestart: () => void
}

const COPY: Record<SupportReason, { title: string; text: string }> = {
  urgent: {
    title: 'Right now, the most important thing is having a person with you.',
    text: 'Let’s stop this exercise. If you are in immediate danger, call 112. You don’t have to go through this alone.',
  },
  symptoms: {
    title: 'This deserves a person’s attention.',
    text: 'If you have new or worsening symptoms, seek guidance from a health professional; don’t wait for this experience.',
  },
}

export function HumanSupport({ reason, onRestart }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  const copy = COPY[reason]
  return (
    <section className="screen" aria-labelledby="support-title">
      <h1 id="support-title" className="title" ref={heading} tabIndex={-1}>
        {copy.title}
      </h1>
      <p className="lead lead--left">{copy.text}</p>
      <SupportContacts />
      <p className="fineprint fineprint--left">
        This check is automatic and simple. It does not assess your health.
      </p>
      <div className="actions">
        <button type="button" className="link" onClick={onRestart}>
          Back to the start
        </button>
      </div>
    </section>
  )
}
