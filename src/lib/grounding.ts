import type { GroundingContent, GroundingResult, Invitations } from './types'
import { capitalize, normalize, overlapRatio, truncateAtWord } from './text'

export const LIMITS = {
  input: 600,
  recognition: 120,
  label: 60,
  invitation: 140,
} as const

export const INVITATION_ORDER = ['touch', 'see', 'hear'] as const

export const FALLBACK_RECOGNITION = 'Waiting without an answer is hard.'

export const FALLBACK_INVITATIONS: Invitations = {
  touch: 'If it feels comfortable, rest one hand on something near you. Notice whether it feels warm or cool.',
  see: 'Let your eyes wander for a moment. Find one small detail you hadn’t noticed before.',
  hear: 'Listen for a moment. Notice the quietest sound you can hear.',
}

export const CLOSING_LINE = 'The thought can still be there. And so can you.'

const DISEASE_RE =
  /\b(cancer|tumou?r|leuka?emia|lymphoma|metasta|malignan|benign|carcinoma|sarcoma|diabetes|stroke|heart attack|sclerosis|alzheimer|parkinson|hiv|aids|hepatitis|cyst|nodule|disease|infection)/
const PROBABILITY_RE = /(\d+\s*%|probab|\blikely\b|unlikely|\brisk\b|\bchances?\b|\bodds\b|statistic|percent)/
const TREATMENT_RE = /(treatment|medicat|medicine|\bpills?\b|\bdose\b|therapy|surgery|chemo|antibiotic|operation)/
const DIAGNOSIS_RE = /(diagnos|symptom|sign of|indicates|means that|prognos)/
const REASSURANCE_RE =
  /(you'?re safe|you are safe|(it'?ll|it will|everything will|everything'?s going to|it'?s going to) be (fine|ok|okay|alright|all right)|(it'?s|it is) (probably )?nothing|nothing serious|not serious|don'?t worry|nothing to worry|just relax|calm down|stay calm|guarantee|for sure|all is well)/
const OUTCOME_RE = /\b(serious|bad news|good news|positive|negative|normal|benign|harmless|dangerous|fatal|worst)\b/
const MEDICAL_CONTEXT_RE = /\b(results?|tests?|scans?|biops\w*|doctors?|clinic|hospital|illness|sick|pain|lump|blood)\b/

const CLINICAL = [DISEASE_RE, PROBABILITY_RE, TREATMENT_RE, DIAGNOSIS_RE, REASSURANCE_RE]

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.replace(/\s+/g, ' ').trim() : null
}

function sentenceCount(text: string): number {
  return text.split(/(?<=[.!?…])\s+/).filter((part) => /[\p{L}\p{N}]/u.test(part)).length
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  const t = normalize(text)
  return patterns.some((re) => re.test(t))
}

function introducesNew(re: RegExp, candidate: string, original: string): boolean {
  const o = normalize(original)
  const matches = normalize(candidate).match(new RegExp(re.source, 'g')) ?? []
  return matches.some((m) => !o.includes(m))
}

export function acceptInvitation(text: string | null): string | null {
  if (!text || text.length > LIMITS.invitation || sentenceCount(text) > 2) return null
  if (matchesAny(text, [...CLINICAL, OUTCOME_RE, MEDICAL_CONTEXT_RE])) return null
  return text
}

export function acceptRecognition(text: string | null): string | null {
  if (!text || text.length > LIMITS.recognition || sentenceCount(text) > 1) return null
  if (matchesAny(text, [...CLINICAL, OUTCOME_RE])) return null
  return text
}

export function acceptThoughtLabel(text: string | null, original: string): string | null {
  if (!text || text.length > LIMITS.label * 1.25) return null
  if (overlapRatio(text, original) < 0.5) return null
  if ([DISEASE_RE, PROBABILITY_RE, TREATMENT_RE, REASSURANCE_RE].some((re) => introducesNew(re, text, original))) {
    return null
  }
  return truncateAtWord(text, LIMITS.label)
}

/** The person's first sentence, shortened. Used whenever the model's label can't be trusted. */
export function localThoughtLabel(text: string): string {
  const first = text.trim().split(/(?<=[.?!…])\s+|\n+/)[0] ?? ''
  return capitalize(truncateAtWord(first.replace(/[;,]+$/, ''), LIMITS.label))
}

export function fallbackContent(text: string): GroundingContent {
  return {
    recognition: FALLBACK_RECOGNITION,
    thought_label: localThoughtLabel(text),
    grounding: { ...FALLBACK_INVITATIONS },
  }
}

function acceptInvitations(raw: unknown): Invitations | null {
  if (!raw || typeof raw !== 'object') return null
  const g = raw as Record<string, unknown>
  const keys = Object.keys(g)
  if (keys.length !== INVITATION_ORDER.length || !INVITATION_ORDER.every((k) => keys.includes(k))) return null

  const touch = acceptInvitation(asString(g.touch))
  const see = acceptInvitation(asString(g.see))
  const hear = acceptInvitation(asString(g.hear))
  if (!touch || !see || !hear) return null
  if (new Set([touch, see, hear].map(normalize)).size !== 3) return null
  return { touch, see, hear }
}

/**
 * Sanitises model output. Each part that fails validation is replaced by its safe default;
 * the three invitations are accepted or replaced together.
 */
export function validateGrounding(raw: unknown, original: string): GroundingContent {
  const fallback = fallbackContent(original)
  if (!raw || typeof raw !== 'object') return fallback
  const r = raw as Record<string, unknown>
  return {
    recognition: acceptRecognition(asString(r.recognition)) ?? fallback.recognition,
    thought_label: acceptThoughtLabel(asString(r.thought_label), original) ?? fallback.thought_label,
    grounding: acceptInvitations(r.grounding) ?? fallback.grounding,
  }
}

export async function requestGrounding(
  text: string,
  { useAi = true, timeoutMs = 9000 } = {},
): Promise<GroundingResult> {
  const input = text.slice(0, LIMITS.input)
  if (useAi) {
    try {
      const response = await fetch('/api/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (response.ok) {
        const data = (await response.json()) as Record<string, unknown> | null
        if (data?.human_support === true) {
          return { kind: 'support', reason: data.reason === 'symptoms' ? 'symptoms' : 'urgent' }
        }
        return { kind: 'grounding', content: validateGrounding(data, input) }
      }
    } catch {
      // Any failure falls through to the predefined invitations.
    }
  }
  return { kind: 'grounding', content: fallbackContent(input) }
}

export async function fetchAiAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/api/status', { signal: AbortSignal.timeout(3000) })
    if (!response.ok) return false
    const data = (await response.json()) as { ai?: boolean }
    return data.ai === true
  } catch {
    return false
  }
}
