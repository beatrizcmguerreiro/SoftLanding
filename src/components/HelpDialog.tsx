import { useEffect, useRef } from 'react'
import { SupportContacts } from './SupportContacts'

type Props = {
  open: boolean
  onClose: () => void
}

export function HelpDialog({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="help-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="sheet__body">
        <h2 id="help-title" className="sheet__title">
          Apoio humano
        </h2>
        <p className="sheet__text">
          Esta experiência não substitui uma pessoa. Se precisas de falar com alguém agora, estes contactos
          funcionam em Portugal.
        </p>
        <SupportContacts />
        <p className="sheet__note">Fora de Portugal, usa o número de emergência local.</p>
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Fechar painel
        </button>
      </div>
    </dialog>
  )
}
