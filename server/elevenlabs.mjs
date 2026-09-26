// Server-side only. The ElevenLabs key is read from the environment and never sent to the browser.
// Audio and text pass through; neither is logged or stored.

const API = 'https://api.elevenlabs.io'
const AGENT_WS = 'wss://api.elevenlabs.io/v1/convai/conversation'
// "Clara - Relaxing, Calm and Soothing", already in the workspace. Override with ELEVENLABS_VOICE_ID.
const DEFAULT_VOICE = 'Qggl4b0xRMiqOwhPtVWT'

export const MAX_AUDIO_BYTES = 8 * 1024 * 1024

export function speechEnabled(env = process.env) {
  return Boolean(env.ELEVENLABS_API_KEY)
}

export function agentEnabled(env = process.env) {
  return Boolean(env.ELEVENLABS_AGENT_ID)
}

/**
 * Scribe transcription of a single recording.
 * @param {Buffer|Uint8Array} audio
 * @param {string} contentType
 * @returns {Promise<string|null>} the transcript, or null when it cannot be produced
 */
export async function transcribe(audio, contentType, env = process.env) {
  if (!speechEnabled(env) || !audio?.byteLength) return null
  const form = new FormData()
  form.append('file', new Blob([audio], { type: contentType || 'audio/webm' }), 'thought.webm')
  form.append('model_id', env.ELEVENLABS_STT_MODEL || 'scribe_v1')
  form.append('tag_audio_events', 'false')
  try {
    const response = await fetch(`${API}/v1/speech-to-text`, {
      method: 'POST',
      headers: { 'xi-api-key': env.ELEVENLABS_API_KEY },
      body: form,
      signal: AbortSignal.timeout(20000),
    })
    if (!response.ok) return null
    const data = await response.json()
    const text = typeof data?.text === 'string' ? data.text.replace(/\s+/g, ' ').trim() : ''
    return text || null
  } catch {
    return null
  }
}

/**
 * One line of guidance spoken in the meditation voice.
 * @param {string} text
 * @returns {Promise<{ audio: Buffer, contentType: string }|null>}
 */
export async function synthesize(text, env = process.env) {
  if (!speechEnabled(env) || !text) return null
  const voice = env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE
  try {
    const response = await fetch(`${API}/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'xi-api-key': env.ELEVENLABS_API_KEY },
      body: JSON.stringify({
        text,
        model_id: env.ELEVENLABS_TTS_MODEL || 'eleven_flash_v2_5',
        // Unhurried and even, so the invitation can be followed rather than listened to.
        voice_settings: { stability: 0.65, similarity_boost: 0.75, speed: 0.85 },
      }),
      signal: AbortSignal.timeout(20000),
    })
    if (!response.ok) return null
    return { audio: Buffer.from(await response.arrayBuffer()), contentType: 'audio/mpeg' }
  } catch {
    return null
  }
}

function firstJsonObject(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

/**
 * One text-only turn with the configured ElevenLabs agent. The agent opens with a greeting,
 * so responses are read until one parses as the organiser JSON.
 * @param {string} text
 * @returns {Promise<Record<string, unknown>|null>}
 */
export function askAgent(text, env = process.env, { timeoutMs = 15000 } = {}) {
  if (!agentEnabled(env)) return Promise.resolve(null)
  return new Promise((resolve) => {
    let socket
    try {
      socket = new WebSocket(`${AGENT_WS}?agent_id=${encodeURIComponent(env.ELEVENLABS_AGENT_ID)}`)
    } catch {
      return resolve(null)
    }
    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { socket.close() } catch { /* already closing */ }
      resolve(value)
    }
    const timer = setTimeout(() => finish(null), timeoutMs)
    socket.onopen = () => socket.send(JSON.stringify({
      type: 'conversation_initiation_client_data',
      conversation_config_override: { conversation: { text_only: true } },
    }))
    socket.onmessage = (event) => {
      let message
      try { message = JSON.parse(event.data) } catch { return }
      if (message.type === 'ping') {
        return socket.send(JSON.stringify({ type: 'pong', event_id: message.ping_event?.event_id }))
      }
      if (message.type === 'conversation_initiation_metadata') {
        return socket.send(JSON.stringify({ type: 'user_message', text }))
      }
      if (message.type !== 'agent_response') return
      const parsed = firstJsonObject(String(message.agent_response_event?.agent_response ?? ''))
      if (parsed) finish(parsed)
    }
    socket.onerror = () => finish(null)
    socket.onclose = () => finish(null)
  })
}
