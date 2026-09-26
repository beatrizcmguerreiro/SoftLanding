import { useEffect, useRef } from 'react'
import { Companion, type Expression } from '../components/Companion'
import { useFocusOnMount } from '../components/useFocusOnMount'
import { useNarration } from '../lib/narration'

const LINE = 'How are you feeling right now? Select the closest match.'

const feelings = ['Anxious', 'Overwhelmed', 'Sad', 'Unsure', 'Okay', 'Calm', 'Happy']
const expressions: Record<string, Expression> = { Anxious: 'anxious', Overwhelmed: 'overwhelmed', Sad: 'sad', Unsure: 'unsure', Okay: 'okay', Calm: 'calm', Happy: 'happy' }

export function Feeling({ value, onChange, onContinue }: { value: string; onChange: (value: string) => void; onContinue: () => void }) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  const track = useRef<HTMLDivElement>(null)
  const selected = Math.max(0, feelings.indexOf(value))
  useNarration(LINE, true)
  useEffect(() => {
    const el = track.current
    if (el) el.scrollLeft = selected * 112
  }, [])
  const choose = (index: number) => {
    onChange(feelings[index])
    track.current?.scrollTo({ left: index * 112, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  return <section className="feeling-screen" aria-labelledby="feeling-title">
    <Companion expression={expressions[value] ?? 'unsure'} />
    <h1 className="title" id="feeling-title" ref={heading} tabIndex={-1}>How are you<br />feeling right now?</h1>
    <p className="feeling-caption">Select the closest match</p>
    <div className="feeling-picker">
      <div className="feeling-wave" aria-hidden="true">{Array.from({ length: 35 }, (_, i) => <i key={i} style={{ height: `${18 + 52 * Math.exp(-(((i - 17) / 7) ** 2))}px` }} />)}</div>
      <div className="feeling-track" ref={track} role="radiogroup" aria-label="How you feel" onScroll={event => {
        const index = Math.max(0, Math.min(feelings.length - 1, Math.round(event.currentTarget.scrollLeft / 112)))
        if (feelings[index] !== value) onChange(feelings[index])
      }}>
        {feelings.map((feeling, index) => <button key={feeling} type="button" role="radio" aria-checked={value === feeling} tabIndex={value === feeling ? 0 : -1}
          onClick={() => choose(index)} onKeyDown={event => {
            const next = event.key === 'ArrowRight' ? Math.min(index + 1, feelings.length - 1) : event.key === 'ArrowLeft' ? Math.max(index - 1, 0) : event.key === 'Home' ? 0 : event.key === 'End' ? feelings.length - 1 : null
            if (next !== null) { event.preventDefault(); choose(next); (track.current?.children[next] as HTMLButtonElement)?.focus({ preventScroll: true }) }
          }}>{feeling}</button>)}
      </div>
      <p className="feeling-hint">Slide to choose - there's no wrong answer.</p>
    </div>
    <button className="btn btn--primary" onClick={onContinue}>Continue</button>
  </section>
}

