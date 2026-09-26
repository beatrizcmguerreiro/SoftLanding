import { useFocusOnMount } from '../components/useFocusOnMount'
import { Companion } from '../components/Companion'

type Props = {
  onStart: () => void
  onHelp: () => void
}

export function Welcome({ onStart, onHelp }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  return (
    <section className="screen screen--center welcome-screen" aria-labelledby="welcome-title">
      <div className="welcome-art" aria-hidden="true">
        <div className="reflection-sheet reflection-sheet--back" />
        <div className="reflection-note reflection-note--cream"><span className="note-spark">✦</span><p>A little space.<br />A moment for you.</p><span className="note-caption">HERE, AT YOUR PACE</span></div>
        <div className="reflection-note reflection-note--lilac"><Companion small /><p>One thought.<br />A softer landing.</p><span className="note-caption">ONE MOMENT AT A TIME</span></div>
        <span className="floating-token floating-token--heart">♥</span>
        <span className="floating-token floating-token--sun">✦</span>
      </div>

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
        <button type="button" className="btn btn--secondary" onClick={onHelp}>
          I need immediate help
        </button>
      </div>

      <p className="fineprint">We don’t interpret tests or give medical answers.</p>
    </section>
  )
}
