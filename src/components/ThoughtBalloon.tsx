import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'

const DRAG_THRESHOLD = 64
const CLICK_SLOP = 6

type Props = {
  id: string
  label: string
  index: number
  selected: boolean
  setDown: boolean
  onToggle: () => void
  onSetDown: () => void
}

export function ThoughtBalloon({ id, label, index, selected, setDown, onToggle, onSetDown }: Props) {
  const [offset, setOffset] = useState(0)
  const start = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const dragged = useRef(false)

  const style = { '--i': index, '--drag': `${offset}px` } as CSSProperties

  if (setDown) {
    return (
      <li className="balloon-slot balloon-slot--down" style={style}>
        <div className="balloon balloon--unknown balloon--down" id={id}>
          <span className="balloon__text">{label}</span>
          <span className="visually-hidden"> (pousado por agora)</span>
        </div>
      </li>
    )
  }

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    start.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId }
    dragged.current = false
  }

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const s = start.current
    if (!s || s.pointerId !== e.pointerId) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (!dragged.current && Math.abs(dx) > CLICK_SLOP && Math.abs(dx) > Math.abs(dy)) {
      dragged.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    if (dragged.current) setOffset(dx)
  }

  const endDrag = (e: PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const s = start.current
    if (!s || s.pointerId !== e.pointerId) return
    start.current = null
    if (dragged.current && !cancelled && Math.abs(offset) >= DRAG_THRESHOLD) {
      onSetDown()
    }
    setOffset(0)
  }

  return (
    <li className="balloon-slot" style={style}>
      <button
        type="button"
        id={id}
        className={`balloon balloon--unknown${selected ? ' is-selected' : ''}${offset ? ' is-dragging' : ''}`}
        aria-expanded={selected}
        aria-controls={`${id}-actions`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, false)}
        onPointerCancel={(e) => endDrag(e, true)}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false
            return
          }
          onToggle()
        }}
      >
        <span className="balloon__text">{label}</span>
      </button>
      <div id={`${id}-actions`} className="balloon-actions" hidden={!selected}>
        <p className="balloon-actions__hint">Podes notar este pensamento sem teres de o seguir agora.</p>
        <button type="button" className="btn btn--soft" onClick={onSetDown}>
          Pousar por agora
        </button>
        <p className="balloon-actions__tip" aria-hidden="true">
          Também o podes arrastar para o lado.
        </p>
      </div>
    </li>
  )
}
