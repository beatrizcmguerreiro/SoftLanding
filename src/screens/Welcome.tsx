import { useFocusOnMount } from '../components/useFocusOnMount'

type Props = {
  onStart: () => void
  onHelp: () => void
}

export function Welcome({ onStart, onHelp }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  return (
    <section className="screen screen--center" aria-labelledby="welcome-title">
      <svg className="stones" viewBox="0 0 240 150" aria-hidden="true" focusable="false">
        <ellipse className="stones__shadow" cx="120" cy="134" rx="92" ry="8" />
        <path
          className="stones__big"
          d="M44 118c-8-30 14-66 58-72 44-6 86 12 92 46 5 26-20 38-72 40-44 2-72 4-78-14z"
        />
        <path className="stones__mid" d="M150 128c-4-16 8-30 30-31 20-1 34 9 34 21 0 12-14 15-34 15-18 0-27 5-30-5z" />
        <path className="stones__small" d="M30 130c-2-9 5-17 17-17 11 0 18 6 18 12s-7 9-18 9c-9 0-15 3-17-4z" />
      </svg>

      <h1 id="welcome-title" className="title title--display" ref={heading} tabIndex={-1}>
        There are things you cannot know yet.
      </h1>
      <p className="lead">
        If waiting for a result is filling your head with scenarios, you can set them down here for a moment.
      </p>

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onStart}>
          Start
        </button>
        <button type="button" className="link" onClick={onHelp}>
          I need help now
        </button>
      </div>

      <p className="fineprint">We don’t interpret tests or give medical answers.</p>
    </section>
  )
}
