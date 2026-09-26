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
          Human support
        </h2>
        <p className="sheet__text">
          This experience doesn’t replace a person. If you need to talk to someone now, these contacts work in
          Portugal.
        </p>
        <SupportContacts />
        <p className="sheet__note">Outside Portugal, use your local emergency number.</p>
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Close panel
        </button>
      </div>
    </dialog>
  )
}
