import { useEffect, useRef, useState } from 'react'
import { LIMITS } from './analysis'

/**
 * Dictation for the writing screen. When the server has an ElevenLabs key the recording is
 * sent to Scribe once the person stops speaking; otherwise the browser's own engine is used.
 * Starting to speak clears the field, so each take replaces the last rather than adding to it.
 * Audio is held in memory only and is never stored by this app.
 */

type BrowserDictation = {
  lang: string; continuous: boolean; interimResults: boolean
  start: () => void; stop: () => void; abort: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null; onend: (() => void) | null
}
type SpeechWindow = Window & { SpeechRecognition?: new () => BrowserDictation; webkitSpeechRecognition?: new () => BrowserDictation }

const TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
const supportedType = () =>
  typeof MediaRecorder === 'undefined' ? null : TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null

export type Dictation = {
  listening: boolean
  transcribing: boolean
  message: string
  toggle: () => void
}

export function useDictation(onChange: (text: string) => void): Dictation {
  const [listening, setListening] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [message, setMessage] = useState('')
  const [remoteVoice, setRemoteVoice] = useState(false)
  const recorder = useRef<MediaRecorder | null>(null)
  const browser = useRef<BrowserDictation | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/status', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((status) => setRemoteVoice(status?.voice === true))
      .catch(() => { /* Without a server key the browser engine is used instead. */ })
    return () => controller.abort()
  }, [])

  useEffect(() => () => {
    if (browser.current) {
      browser.current.onresult = null
      browser.current.onerror = null
      browser.current.onend = null
      browser.current.abort()
    }
    recorder.current?.stream.getTracks().forEach((track) => track.stop())
    if (recorder.current?.state === 'recording') recorder.current.stop()
  }, [])

  const startRemote = async () => {
    const mimeType = supportedType()
    if (!mimeType || !navigator.mediaDevices?.getUserMedia) return startBrowser()
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setMessage('SoftLanding couldn’t reach your microphone. You can type instead.')
      return
    }
    const chunks: Blob[] = []
    const recording = new MediaRecorder(stream, { mimeType })
    recorder.current = recording
    recording.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
    recording.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop())
      setListening(false)
      recorder.current = null
      if (!chunks.length) return
      setTranscribing(true)
      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': mimeType },
          body: new Blob(chunks, { type: mimeType }),
          signal: AbortSignal.timeout(25000),
        })
        if (!response.ok) throw new Error(String(response.status))
        const data = (await response.json()) as { text?: string }
        if (!data.text) throw new Error('empty')
        onChange(data.text.slice(0, LIMITS.input))
        setMessage('')
      } catch {
        setMessage('Your words didn’t come through. You can try again or type instead.')
      } finally {
        setTranscribing(false)
      }
    }
    onChange('')
    recording.start()
    setListening(true)
    setMessage('')
  }

  const startBrowser = () => {
    const Engine = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition
    if (!Engine) {
      setMessage('You can use your keyboard’s microphone to dictate in this browser.')
      return
    }
    const recognition = new Engine()
    browser.current = recognition
    recognition.lang = 'en-GB'
    recognition.continuous = false
    recognition.interimResults = true
    onChange('')
    recognition.onresult = (event) =>
      onChange(Array.from(event.results).map((result) => result[0].transcript).join(' ').slice(0, LIMITS.input))
    recognition.onerror = () => {
      setListening(false)
      setMessage('Dictation couldn’t start. You can type or use your device’s dictation instead.')
    }
    recognition.onend = () => setListening(false)
    try {
      recognition.start()
      setListening(true)
      setMessage('')
    } catch {
      setMessage('Dictation isn’t available right now. You can still type.')
      setListening(false)
    }
  }

  const toggle = () => {
    if (transcribing) return
    if (listening) {
      if (recorder.current?.state === 'recording') recorder.current.stop()
      else browser.current?.stop()
      return
    }
    // Clear on the click, before the microphone even opens, so the last take never lingers.
    onChange('')
    if (remoteVoice) void startRemote()
    else startBrowser()
  }

  return { listening, transcribing, message, toggle }
}
