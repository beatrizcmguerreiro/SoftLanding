import { useState, type FormEvent } from 'react'
import { LIMITS } from '../lib/analysis'
import { useFocusOnMount } from '../components/useFocusOnMount'

export const DEMO_TEXT = 'E se o resultado for grave? Nem sei quando chega e estou sempre a pesquisar.'

type Props = {
  text: string
  aiAvailable: boolean
  onChange: (text: string) => void
  onSubmit: () => void
  onBack: () => void
}

export function Write({ text, aiAvailable, onChange, onSubmit, onBack }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  const [error, setError] = useState(false)
  const nearLimit = text.length >= LIMITS.input * 0.8

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      setError(true)
      document.getElementById('thoughts')?.focus()
      return
    }
    onSubmit()
  }

  return (
    <section className="screen" aria-labelledby="write-title">
      <form className="write" onSubmit={submit} noValidate>
        <h1 id="write-title" className="title" ref={heading} tabIndex={-1}>
          <label htmlFor="thoughts">O que te está a passar pela cabeça?</label>
        </h1>
        <p id="thoughts-help" className="lead lead--left">
          Pode ser uma frase solta. Não precisas de a organizar.
        </p>

        <div className={`field${error ? ' field--error' : ''}`}>
          <textarea
            id="thoughts"
            className="field__input"
            value={text}
            maxLength={LIMITS.input}
            rows={6}
            aria-describedby={`thoughts-help${error ? ' thoughts-error' : ''}${nearLimit ? ' thoughts-count' : ''}`}
            aria-invalid={error || undefined}
            onChange={(e) => {
              onChange(e.target.value)
              if (error && e.target.value.trim()) setError(false)
            }}
          />
          <div className="field__meta">
            <button
              type="button"
              className="link link--small"
              onClick={() => {
                onChange(DEMO_TEXT)
                setError(false)
              }}
            >
              Usar exemplo (texto fictício)
            </button>
            {nearLimit && (
              <span id="thoughts-count" className="field__count">
                {text.length}/{LIMITS.input}
              </span>
            )}
          </div>
          {error && (
            <p id="thoughts-error" className="field__error" role="alert">
              Escreve pelo menos uma frase, mesmo curta.
            </p>
          )}
        </div>

        <p className="fineprint fineprint--left">
          {aiAvailable
            ? 'Ao continuar, o texto é enviado a um serviço de IA externo (Anthropic) só para ser organizado. Não o guardamos. Nesta demo, usa texto fictício.'
            : 'O texto é organizado neste dispositivo e não é enviado nem guardado.'}
        </p>

        <div className="actions">
          <button type="submit" className="btn btn--primary">
            Dar espaço aos pensamentos
          </button>
          <button type="button" className="link" onClick={onBack}>
            Voltar
          </button>
        </div>
      </form>
    </section>
  )
}
