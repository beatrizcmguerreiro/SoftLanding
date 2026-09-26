import { useRef, useState, type CSSProperties } from 'react'
import type { Analysis, AnalysisSource } from '../lib/types'
import { isTimingSuggestion, PATTERN_CAPTION, TIMING_PHRASE } from '../lib/analysis'
import { ThoughtBalloon } from '../components/ThoughtBalloon'
import { useFocusOnMount } from '../components/useFocusOnMount'

type Props = {
  analysis: Analysis
  source: AnalysisSource
  aiAvailable: boolean
  announce: (message: string) => void
  onExit: () => void
}

export function Organized({ analysis, source, aiAvailable, announce, onExit }: Props) {
  const heading = useFocusOnMount<HTMLHeadingElement>()
  const unknownRegion = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [setDown, setSetDown] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)

  const canDo = analysis.can_do[0]
  const phrase = canDo && isTimingSuggestion(canDo.suggestion) ? TIMING_PHRASE : null

  const putDown = (i: number) => {
    setSetDown((prev) => new Set(prev).add(i))
    setSelected(null)
    announce('Thought set aside for now. It is still visible, further back.')
    requestAnimationFrame(() => unknownRegion.current?.focus())
  }

  const copyPhrase = async () => {
    if (!phrase) return
    try {
      await navigator.clipboard.writeText(phrase)
      setCopied(true)
      announce('Phrase copied.')
    } catch {
      const el = document.getElementById('ready-phrase')
      if (el) window.getSelection()?.selectAllChildren(el)
      announce('Couldn’t copy automatically. The phrase has been selected.')
    }
  }

  const unknownItems = analysis.cannot_know
    .map((item, i) => ({ ...item, i }))
    .sort((a, b) => Number(setDown.has(a.i)) - Number(setDown.has(b.i)))

  let order = 0
  const nextIndex = () => order++

  return (
    <section className="screen screen--wide" aria-labelledby="organized-title">
      <h1 id="organized-title" className="title title--center" ref={heading} tabIndex={-1}>
        The fear is real. The result is not yet known.
      </h1>

      <div className="regions">
        <section className="region region--can" aria-labelledby="can-title">
          <h2 id="can-title" className="region__title">
            <span className="region__mark" aria-hidden="true" />
            Can do
          </h2>
          {canDo ? (
            <>
              <ul className="balloons" role="list">
                <li className="balloon-slot" style={{ '--i': nextIndex() } as CSSProperties}>
                  <div className="balloon balloon--can">
                    <span className="balloon__text">{canDo.label}</span>
                  </div>
                </li>
              </ul>
              {canDo.suggestion && (
                <div className="microaction" style={{ '--i': nextIndex() } as CSSProperties}>
                  <p className="microaction__text">
                    <span className="microaction__eyebrow">If you want: </span>
                    {canDo.suggestion}
                  </p>
                  {phrase && (
                    <details className="microaction__more">
                      <summary>A phrase you could use</summary>
                      <p className="microaction__phrase" id="ready-phrase">
                        “{phrase}”
                      </p>
                      <button type="button" className="btn btn--soft" onClick={copyPhrase}>
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </details>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="region__empty">You don’t need to find a task for this moment.</p>
          )}
        </section>

        <section className="region region--unknown" aria-labelledby="unknown-title">
          <h2 id="unknown-title" className="region__title">
            <span className="region__mark region__mark--hollow" aria-hidden="true" />
            Cannot know yet
          </h2>
          <div ref={unknownRegion} tabIndex={-1} className="region__focus" aria-labelledby="unknown-title">
            {unknownItems.length > 0 ? (
              <ul className="balloons" role="list">
                {unknownItems.map((item) => (
                  <ThoughtBalloon
                    key={item.i}
                    id={`unknown-${item.i}`}
                    label={item.label}
                    index={nextIndex()}
                    selected={selected === item.i}
                    setDown={setDown.has(item.i)}
                    onToggle={() => setSelected((cur) => (cur === item.i ? null : item.i))}
                    onSetDown={() => putDown(item.i)}
                  />
                ))}
              </ul>
            ) : (
              <p className="region__empty">Nothing here for now.</p>
            )}
          </div>
        </section>
      </div>

      {analysis.pattern && <p className="pattern">{PATTERN_CAPTION}</p>}

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={onExit}>
          Return to the present
        </button>
      </div>

      <p className="fineprint">
        {source === 'ai'
          ? 'Organised by AI, using only your words.'
          : aiAvailable
            ? 'The AI didn’t respond, so this was organised on your device.'
            : 'Organised on your device, using only your words.'}
      </p>
    </section>
  )
}
