import { useFocusOnMount } from '../components/useFocusOnMount'

type Props = {
  onStart: () => void
  onHelp: () => void
}

export function Welcome({ onStart, onHelp }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  return (
    <section className="screen screen--center" aria-labelledby="welcome-title">
      <svg className="stones" viewBox="0 0 120 100" aria-hidden="true" focusable="false">
        <ellipse className="stones__shadow" cx="60" cy="93" rx="44" ry="4" />
        <path className="stones__big" d="M18 80c0-12 18-20 42-20s42 8 42 20-18 12-42 12-42 0-42-12z" />
        <path className="stones__mid" d="M32 52c0-9 12-15 28-15s28 6 28 15-12 10-28 10-28-1-28-10z" />
        <path className="stones__small" d="M45 28c0-6 7-10 15-10s15 4 15 10-7 7-15 7-15-1-15-7z" />
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
