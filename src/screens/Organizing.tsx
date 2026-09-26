import type { CSSProperties } from 'react'

type Props = {
  text: string
  slow: boolean
}

export function Organizing({ text, slow }: Props) {
  const words = text.split(/\s+/).filter(Boolean).slice(0, 18)
  return (
    <section className="screen screen--center" aria-labelledby="organizing-title" aria-busy="true">
      <h1 id="organizing-title" className="visually-hidden">
        A organizar os pensamentos
      </h1>
      <p className="fragments" aria-hidden="true">
        {words.map((word, i) => (
          <span key={i} className="fragment" style={{ '--i': i } as CSSProperties}>
            {word}
          </span>
        ))}
      </p>
      {slow && <p className="fineprint">A organizar…</p>}
    </section>
  )
}
