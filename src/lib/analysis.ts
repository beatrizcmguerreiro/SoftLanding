import type { Analysis, AnalysisSource, CanDoItem, CannotKnowItem } from './types'
import { capitalize, normalize, overlapRatio, truncateAtWord } from './text'

export const LIMITS = {
  input: 600,
  label: 65,
  suggestion: 100,
  pattern: 75,
  canDo: 1,
  cannotKnow: 3,
  total: 4,
} as const

export const TIMING_SUGGESTION = 'Confirmar quando e como será comunicado'
export const TIMING_PHRASE =
  'Podem dizer-me quando devo esperar o resultado e como serei contactado/a?'
export const PATTERN_CAPTION = 'Pesquisar outra vez talvez não traga a resposta que falta.'

const TIMING_RE = [
  /\b(quando|como)\b(\s+\S+){0,4}?\s+(chega|chegam|chegar|chegara|vem|veem|vir|vira|sai|saem|sair|saira|recebo|receber|dao|ligam|contactam|comunicam|avisam|dizem|fica pronto|ficam prontos|tenho o resultado|terei o resultado)\b/,
  /\bquanto tempo\b/,
  /\bprazo\b/,
]

const SEARCH_RE = /\b(pesquis|googl|procur(o|ar|ei|ando) (na internet|online|no google|sintomas|sobre))/

const DISEASE_RE =
  /\b(cancro|cancer|tumou?r|leucemia|linfoma|metasta|malign|benign|carcinoma|sarcoma|diabetes|avc|enfarte|esclerose|alzheimer|parkinson|hiv|sida|hepatite|quisto|nodulo|doenca)/g
const PROBABILITY_RE = /(\d+\s*%|probab|provavel|improvavel|\brisco\b|\bchances?\b|estatistic|percentagem)/
const TREATMENT_RE = /(tratament|medicac|medicament|comprimido|\btomar\b|\bdose\b|terapia|cirurgi|quimio|antibiot|operac)/
const DIAGNOSIS_RE = /(diagnost|sintoma de|sinal de|indica que|significa que)/
const REASSURANCE_RE =
  /((vai|ha de|deve) correr (tudo )?bem|nao (e|deve ser|sera|vai ser) (nada )?grave|nao te preocupes|relaxa|e so ansiedade|de certeza|garant|fica tranquil|nao ha motivo|esta tudo bem)/
const TIMEFRAME_RE = /\b\d+\s*(dias?|semanas?|horas?|meses?)\b/

function introducesNew(re: RegExp, candidate: string, original: string): boolean {
  const c = normalize(candidate)
  const o = normalize(original)
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`
  const matches = c.match(new RegExp(re.source, flags)) ?? []
  return matches.some((m) => !o.includes(m))
}

function unsafeLabel(label: string, original: string): boolean {
  return (
    introducesNew(DISEASE_RE, label, original) ||
    introducesNew(PROBABILITY_RE, label, original) ||
    introducesNew(REASSURANCE_RE, label, original) ||
    introducesNew(TREATMENT_RE, label, original)
  )
}

function unsafeSuggestion(suggestion: string): boolean {
  const s = normalize(suggestion)
  return [DISEASE_RE, PROBABILITY_RE, TREATMENT_RE, DIAGNOSIS_RE, REASSURANCE_RE, TIMEFRAME_RE].some(
    (re) => new RegExp(re.source).test(s),
  )
}

export function isTimingQuestion(text: string): boolean {
  const t = normalize(text)
  return TIMING_RE.some((re) => re.test(t))
}

export function mentionsSearching(text: string): boolean {
  return SEARCH_RE.test(normalize(text))
}

export function isTimingSuggestion(suggestion: string | undefined): boolean {
  if (!suggestion) return false
  const s = normalize(suggestion)
  return /(quando|prazo)/.test(s) && /(comunica|contact|resultado|receb|chega)/.test(s)
}

function cleanLabel(text: string): string {
  const trimmed = text.trim().replace(/[.;,…]+$/, '')
  return capitalize(truncateAtWord(trimmed, LIMITS.label))
}

/** Splits text into short clauses the person actually wrote, without rewording them. */
export function splitClauses(text: string): string[] {
  const sentences = text
    .split(/(?<=[.?!;…])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const clauses: string[] = []
  for (const sentence of sentences) {
    const parts = sentence.split(/\s+(e|mas)\s+/i)
    let current = parts[0] ?? ''
    for (let i = 1; i < parts.length; i += 2) {
      const joiner = parts[i]
      const next = parts[i + 1] ?? ''
      const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length
      const startsWithNoun = /^(a|o|as|os|um|uma|uns|umas|meu|minha|meus|minhas|teu|tua|seu|sua|este|esta|esse|essa)\s/i.test(next)
      if (wordCount(current) >= 3 && wordCount(next) >= 3 && !startsWithNoun) {
        clauses.push(current)
        current = next
      } else {
        current = `${current} ${joiner} ${next}`
      }
    }
    if (current.trim()) clauses.push(current)
  }
  return clauses.map((c) => c.trim()).filter((c) => c.replace(/[^\p{L}\p{N}]/gu, '').length > 0)
}

/** Local analysis used whenever the AI is unavailable or its output fails validation. */
export function safeFallback(text: string): Analysis {
  const clauses = splitClauses(text.slice(0, LIMITS.input))
  const canDo: CanDoItem[] = []
  const cannotKnow: CannotKnowItem[] = []
  let pattern: string | undefined

  for (const clause of clauses) {
    if (canDo.length < LIMITS.canDo && isTimingQuestion(clause)) {
      canDo.push({ label: cleanLabel(clause), suggestion: TIMING_SUGGESTION })
    } else if (!pattern && mentionsSearching(clause)) {
      pattern = cleanLabel(clause).slice(0, LIMITS.pattern)
    } else if (cannotKnow.length < LIMITS.cannotKnow) {
      cannotKnow.push({ label: cleanLabel(clause) })
    }
  }

  if (canDo.length === 0 && cannotKnow.length === 0) {
    cannotKnow.push({ label: cleanLabel(pattern ?? text) })
  }

  return { can_do: canDo, cannot_know: cannotKnow, pattern, human_support: false }
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.replace(/\s+/g, ' ').trim() : null
}

/** Sanitises model output. Returns null when nothing trustworthy remains. */
export function validateAnalysis(result: unknown, originalText: string): Analysis | null {
  if (!result || typeof result !== 'object') return null
  const r = result as Record<string, unknown>
  if (!Array.isArray(r.can_do) || !Array.isArray(r.cannot_know)) return null

  const humanSupport = r.human_support === true
  if (humanSupport) return { can_do: [], cannot_know: [], human_support: true }

  const acceptLabel = (raw: unknown): string | null => {
    const label = asString(raw)
    if (!label || label.length > LIMITS.label * 1.5) return null
    if (overlapRatio(label, originalText) < 0.5) return null
    if (unsafeLabel(label, originalText)) return null
    return truncateAtWord(label, LIMITS.label)
  }

  const canDo: CanDoItem[] = []
  for (const item of r.can_do.slice(0, LIMITS.canDo)) {
    if (!item || typeof item !== 'object') continue
    const label = acceptLabel((item as Record<string, unknown>).label)
    if (!label) continue
    const suggestion = asString((item as Record<string, unknown>).suggestion) ?? undefined
    if (suggestion && (suggestion.length > LIMITS.suggestion || unsafeSuggestion(suggestion))) continue
    canDo.push(suggestion ? { label, suggestion } : { label })
  }

  const cannotKnow: CannotKnowItem[] = []
  for (const item of r.cannot_know) {
    if (cannotKnow.length >= LIMITS.cannotKnow) break
    if (!item || typeof item !== 'object') continue
    const label = acceptLabel((item as Record<string, unknown>).label)
    if (label) cannotKnow.push({ label })
  }

  if (canDo.length + cannotKnow.length === 0) return null

  let pattern: string | undefined
  const rawPattern = asString(r.pattern)
  if (
    rawPattern &&
    rawPattern.length <= LIMITS.pattern &&
    mentionsSearching(originalText) &&
    !unsafeLabel(rawPattern, originalText) &&
    !DIAGNOSIS_RE.test(normalize(rawPattern))
  ) {
    pattern = rawPattern
  }

  return { can_do: canDo, cannot_know: cannotKnow, pattern, human_support: false }
}

export type AnalysisResult = { analysis: Analysis; source: AnalysisSource }

export async function analyzeThoughts(text: string, timeoutMs = 9000): Promise<AnalysisResult> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, LIMITS.input) }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) throw new Error(`status ${response.status}`)
    const validated = validateAnalysis(await response.json(), text)
    if (validated) return { analysis: validated, source: 'ai' }
  } catch {
    // Any failure falls through to the local, deterministic analysis.
  }
  return { analysis: safeFallback(text), source: 'local' }
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
