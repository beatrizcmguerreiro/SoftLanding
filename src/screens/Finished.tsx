import { useFocusOnMount } from '../components/useFocusOnMount'

type Props = {
  onRestart: () => void
}

export function Finished({ onRestart }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  return (
    <section className="screen screen--center screen--quiet" aria-labelledby="finished-title">
      <h1 id="finished-title" className="title title--display" ref={heading} tabIndex={-1}>
        See you soon.
      </h1>
      <p className="lead">What you wrote hasn’t been saved. You can close this tab whenever you like.</p>
      <button type="button" className="link link--small" onClick={onRestart}>
        Back to the start
      </button>
    </section>
  )
}
