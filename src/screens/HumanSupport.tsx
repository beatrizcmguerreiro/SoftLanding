import type { SupportReason } from '../lib/types'
import { SupportContacts } from '../components/SupportContacts'
import { useFocusOnMount } from '../components/useFocusOnMount'

type Props = {
  reason: SupportReason
  onRestart: () => void
}

const COPY: Record<SupportReason, { title: string; text: string }> = {
  urgent: {
    title: 'Agora, o mais importante é teres uma pessoa contigo.',
    text: 'Vamos parar este exercício. Se estás em perigo imediato, liga 112. Não precisas de passar por isto sozinho/a.',
  },
  symptoms: {
    title: 'Isto merece a atenção de uma pessoa.',
    text: 'Se tens sintomas novos ou a piorar, procura orientação de um profissional de saúde; não esperes por esta experiência.',
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
        Esta verificação é automática e simples. Não avalia o teu estado de saúde.
      </p>
      <div className="actions">
        <button type="button" className="link" onClick={onRestart}>
          Voltar ao início
        </button>
      </div>
    </section>
  )
}
