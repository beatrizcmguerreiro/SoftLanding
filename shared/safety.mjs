const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim()

// Basic keyword safeguards for the demo. This is NOT clinical triage.
// Portuguese patterns are kept alongside English so a Portuguese message is still caught.

const HUMAN_SUPPORT_PATTERNS = [
  /\b(in immediate danger|in danger|overdos\w*|can'?t breathe|cannot breathe|struggling to breathe|severe chest pain|bleeding heavily)\b/,
  /\bhurt(ing)? myself\b/,
  /\bharm(ing)? myself\b/,
  /\bkill(ing)? myself\b/,
  /\bsuicid/,
  /\bself[- ]?harm/,
  /\b(don'?t|do not) feel safe\b/,
  /\b(i'?m|i am) not safe\b/,
  /\b(don'?t|do not) want to (live|be alive|be here anymore)\b/,
  /\bwant to die\b/,
  /\bend (it all|my life)\b/,
  /\bneed help (now|right now|urgently)\b/,
  /\bemergency\b/,
  /\bmagoar[- ]?me\b/,
  /\bmatar[- ]?me\b/,
  /\bnao (me )?sinto (em )?seguranca\b/,
  /\bnao quero (mais )?viver\b/,
  /\bquero morrer\b/,
]

const SYMPTOM_PATTERNS = [
  /\bnew symptoms?\b/,
  /\bsymptoms? (is|are|that'?s|that are) new\b/,
  /\b(feel|feeling|i'?m|i am|getting|got|it'?s|it is|it got) (much |even )?worse\b/,
  /\bworsening\b/,
  /\bgetting worse\b/,
  /\bnew (pain|lump|rash|swelling|bleeding)\b/,
  /\bsintomas? novos?\b/,
  /\bnovos? sintomas?\b/,
  /\b(estou|sinto[- ]me) (cada vez )?pior\b/,
]

export function needsHumanSupport(text) {
  const t = normalize(text)
  return HUMAN_SUPPORT_PATTERNS.some((re) => re.test(t))
}

export function mentionsNewOrWorseningSymptoms(text) {
  const t = normalize(text)
  return SYMPTOM_PATTERNS.some((re) => re.test(t))
}

