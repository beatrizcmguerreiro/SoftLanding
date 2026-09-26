import { useEffect, useState } from 'react'

/**
 * Speaks one line of guidance at a time through the ElevenLabs voice on the server.
 * Silence is always an option: the scene reads the same with the voice off, and a line
 * that fails to arrive is skipped rather than retried.
 */
export function useNarration(line: string, enabled: boolean): boolean {
  const [spoken, setSpoken] = useState('')

  useEffect(() => {
    if (!enabled || !line) return
    const controller = new AbortController()
    let element: HTMLAudioElement | null = null
    let url = ''
    fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: line }),
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.blob() : Promise.reject(new Error(String(response.status)))))
      .then((blob) => {
        if (controller.signal.aborted) return
        url = URL.createObjectURL(blob)
        element = new Audio(url)
        element.onended = () => setSpoken('')
        setSpoken(line)
        return element.play()
      })
      .catch(() => setSpoken(''))
    return () => {
      controller.abort()
      element?.pause()
      if (url) URL.revokeObjectURL(url)
    }
  }, [line, enabled])

  // A new line, or the voice being turned off, makes the previous line stale without a reset.
  return enabled && spoken === line
}
