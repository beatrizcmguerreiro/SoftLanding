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
        <h2 id="help-title" className="sheet__title" tabIndex={-1} autoFocus>
          Talk to someone
        </h2>
        <p className="sheet__text">
          You don’t have to go through this alone. If you’d like to speak with someone, you can reach out below.
        </p>
        <SupportContacts />
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Close panel
        </button>
      </div>
    </dialog>
  )
}
