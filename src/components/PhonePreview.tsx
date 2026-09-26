import { useEffect, useState } from 'react'
import './phone-preview.css'

const WIDTH = 419
const HEIGHT = 878

export function PhonePreview() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const resize = () => setScale(Math.max(0.1, Math.min(1, (window.innerWidth - 40) / WIDTH, (window.innerHeight - 100) / HEIGHT)))
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  const source = new URL(window.location.href)
  source.searchParams.delete('phone')
  source.searchParams.delete('framed')
  source.searchParams.set('plain', '1')
  const embeddedSource = new URL(window.location.href)
  embeddedSource.searchParams.delete('phone')
  embeddedSource.searchParams.delete('plain')
  embeddedSource.searchParams.set('framed', '1')
  return (
    <main className="phone-preview">
      <div className="phone-preview__stage" style={{ width: WIDTH * scale, height: HEIGHT * scale }}>
        <div className="phone-device" style={{ transform: `scale(${scale})` }}>
          <span className="phone-device__switch" aria-hidden="true" />
          <span className="phone-device__volume" aria-hidden="true" />
          <span className="phone-device__power" aria-hidden="true" />
          <div className="phone-device__screen">
            <div className="phone-status" aria-hidden="true">
              <span>9:41</span><span className="phone-island" />
              <span className="phone-status__icons">
                <svg viewBox="0 0 20 14"><path d="M1 13V10h3v3H1Zm5 0V7h3v6H6Zm5 0V4h3v9h-3Zm5 0V1h3v12h-3Z" fill="currentColor" /></svg>
                <svg viewBox="0 0 20 14"><path d="M2 4Q10-2 18 4M5 7q5-4 10 0M8 10q2-2 4 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="10" cy="13" r="1" /></svg>
                <span className="phone-battery" />
              </span>
            </div>
            <iframe src={embeddedSource.href} title="SoftLanding phone preview" allow="microphone" />
            <div className="phone-home" aria-hidden="true"><span /></div>
          </div>
        </div>
      </div>
      <a className="phone-preview__exit" href={source.href}>Open without phone frame</a>
    </main>
  )
}
