const KEYS = ['touch', 'see', 'hear']
const prohibited = /\b(safe|serious|relax|diagnos\w*|symptom\w*|cancer|tumou?r|disease|benign|malignan\w*|treatment|medicat\w*|cure|clinical|normal|abnormal|probab\w*|likely|unlikely|risk|percent|guarantee|anxiety disorder|panic attack)\b|\d+\s*%|\b(fine|okay|alright|nothing wrong)\b|\b(result|test)\b.{0,30}\b(will|means|indicates|shows)\b/i
const senses = {
  touch: /\b(touch|texture|pressure|contact|fingertips?|palm|surface|sensation|temperature|weight)\b/i,
  see: /\b(look|eyes|gaze|colou?r|light|darkness|shape|outline|visual)\b/i,
  hear: /\b(listen|sound|hear|quiet|auditory)\b/i,
}
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))
function short(value, maxWords, maxSentences) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 240 &&
    value.trim().split(/\s+/).length <= maxWords && value.split(/[.!?]+/).filter(s => s.trim()).length <= maxSentences &&
    !/[\n<>]/.test(value)
}
export function thoughtExcerpt(text) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= 85) return clean
  const cut = clean.slice(0, 82)
  return cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : 82) + '…'
}
export function fallbackGrounding(text) {
  return {
    recognition: 'Lets find somewhere soft to land.',
    thought_label: thoughtExcerpt(text),
    grounding: {
      touch: 'Take deep breaths. Rest your fingertips on a nearby surface. Notice whether it feels smooth, rough, warm or cool.',
      see: 'Keep going - deep breaths. Look for one colour around you. Let your eyes follow and find the shape of something in that colour.',
      hear: 'One more. Listen for one sound nearby and notice whether it stays steady or comes and goes.',
    },
  }
}
// Conservative content guard, not a clinical assessment or a guarantee of semantic safety.
export function validateGrounding(value, original) {
  if (!exactKeys(value, ['recognition', 'thought_label', 'grounding']) || !exactKeys(value.grounding, KEYS)) return null
  if (!short(value.recognition, 24, 1) || prohibited.test(value.recognition) || !/\b(wait|waiting)\b/i.test(value.recognition)) return null
  // Require an extractive label: rewriting can reverse meaning or introduce a new fear.
  const label = value.thought_label
  if (!short(label, 25, 2) || label.length > 85 || !original.toLowerCase().includes(label.replace(/…$/, '').toLowerCase())) return null
  const invitations = KEYS.map(key => value.grounding[key])
  if (new Set(invitations).size !== 3) return null
  for (const key of KEYS) {
    const invitation = value.grounding[key]
    if (!short(invitation, 40, 2) || prohibited.test(invitation) || !senses[key].test(invitation)) return null
    if (/[?]/.test(invitation) || /\b(answer|tell me|rate|report|type|write|respond|hold your breath|blood|heart|pain|illness|infection|medical|doctor|hospital|diagnosis|test results?)\b/i.test(invitation)) return null
    // Named possessions/locations must be conditional or present in the person's words.
    for (const detail of ['phone', 'bed', 'blanket', 'chair', 'window', 'room', 'screen', 'night']) {
      if (new RegExp(`\\b${detail}\\b`, 'i').test(invitation) && !new RegExp(`\\b${detail}\\b`, 'i').test(original) && !/\bif\b/i.test(invitation)) return null
    }
  }
  return { recognition: value.recognition.trim(), thought_label: label.trim(), grounding: Object.fromEntries(KEYS.map(key => [key, value.grounding[key].trim()])) }
}
