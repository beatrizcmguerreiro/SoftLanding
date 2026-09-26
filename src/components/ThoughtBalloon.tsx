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
          <span className="visually-hidden"> (set aside for now)</span>
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
    const dx = e.clientX - s.x
    const horizontal = Math.abs(dx) > Math.abs(e.clientY - s.y)
    if (!cancelled && horizontal && Math.abs(dx) >= DRAG_THRESHOLD) {
      dragged.current = true
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
        <p className="balloon-actions__hint">You can notice this thought without having to follow it now.</p>
        <button type="button" className="btn btn--soft" onClick={onSetDown}>
          Set aside for now
        </button>
        <p className="balloon-actions__tip" aria-hidden="true">
          You can also drag it to the side.
        </p>
      </div>
    </li>
  )
}
