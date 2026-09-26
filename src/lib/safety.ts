import { normalize } from './text'

// Basic keyword safeguards for the demo. This is NOT clinical triage.

const HUMAN_SUPPORT_PATTERNS: RegExp[] = [
  /\bmagoar[- ]?me\b/,
  /\bme magoar\b/,
  /\bmatar[- ]?me\b/,
  /\bme matar\b/,
  /\bsuicid/,
  /\bauto[- ]?(lesao|mutila|agress)/,
  /\bfazer mal a mim\b/,
  /\bnao (me )?sinto (em )?seguranca\b/,
  /\bnao estou em seguranca\b/,
  /\bnao quero (mais )?viver\b/,
  /\bquero morrer\b/,
  /\bacabar com (tudo|a minha vida|isto tudo)\b/,
  /\bpor fim a (tudo|minha vida|a minha vida)\b/,
  /\bpreciso de ajuda (ja|agora|urgente)\b/,
  /\bemergencia\b/,
]

const SYMPTOM_PATTERNS: RegExp[] = [
  /\bsintomas? novos?\b/,
  /\bnovos? sintomas?\b/,
  /\b(estou|sinto[- ]me|fiquei|esta|estao) (cada vez )?pior(es)?\b/,
  /\bpiorou\b/,
  /\bpioraram\b/,
  /\ba piorar\b/,
  /\bcada vez pior\b/,
  /\bapareceu (uma|um) (dor|nodulo|mancha|inchaco|caroco)\b/,
]

export function needsHumanSupport(text: string): boolean {
  const t = normalize(text)
  return HUMAN_SUPPORT_PATTERNS.some((re) => re.test(t))
}

export function mentionsNewOrWorseningSymptoms(text: string): boolean {
  const t = normalize(text)
  return SYMPTOM_PATTERNS.some((re) => re.test(t))
}
