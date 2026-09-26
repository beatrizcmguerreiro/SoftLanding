import { useFocusOnMount } from '../components/useFocusOnMount'

type Props = {
  onRestart: () => void
}

export function Finished({ onRestart }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  return (
    <section className="screen screen--center screen--quiet" aria-labelledby="finished-title">
      <h1 id="finished-title" className="title title--display" ref={heading} tabIndex={-1}>
        Até já.
      </h1>
      <p className="lead">O que escreveste não ficou guardado. Podes fechar este separador quando quiseres.</p>
      <button type="button" className="link link--small" onClick={onRestart}>
        Voltar ao início
      </button>
    </section>
  )
}
