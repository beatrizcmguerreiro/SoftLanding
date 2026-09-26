// The ElevenLabs agent returns the organiser schema from the plan:
// { can_do: [{ label, suggestion }], cannot_know: [{ label }], pattern, human_support }.
// It decides which of the person's words to hold on to, which practical step is available,
// and which loop they are caught in. The spoken guidance is then assembled from pre-approved
// invitations, so no generated sentence can reach the screen or the voice unchecked.

import { fallbackGrounding, thoughtExcerpt } from './grounding.mjs'

const LIMITS = { label: 85, suggestion: 100 }
const clinical = /\b(diagnos\w*|symptom\w*|cancer|tumou?r|leuka?emia|lymphoma|metasta\w*|malignan\w*|benign|carcinoma|sarcoma|disease|infection|treatment|medicat\w*|medicine|therapy|surgery|chemo|antibiotic|probab\w*|likely|unlikely|risk|chances?|odds|percent|statistic\w*|guarantee|serious|normal|abnormal|prognos\w*)\b|\d+\s*%|\b\d+\s*(hours?|days?|weeks?|months?)\b/i
const reassurance = /((it'?ll|it will|everything will|it'?s going to|everything'?s going to) be (fine|ok|okay|alright)|(it'?s|it is) (probably )?nothing|not serious|don'?t worry|nothing to worry|\brelax\b|just anxiety|all is well|stay calm|calm down|you'?re safe|you are safe|for sure)/i

// Case and curly quotes only, so offsets still line up with the person's own text.
const align = (text) => text.toLowerCase().replace(/[\u2018\u2019]/g, "'")
const asText = (value) => (typeof value === 'string' && value.trim() ? value.replace(/\s+/g, ' ').trim() : null)

/**
 * Pre-approved invitations, one set per loop the agent can recognise. Each set is covered by
 * the grounding validator in tests: touch, then see, then hear, with no question and no claim.
 */
const MEDITATIONS = [
  {
    signal: /\b(search\w*|googl\w*|look(ing|ed)?\s+(it|them|things|symptoms)\s+up|read(ing)?\s+(about it|online)|scroll\w*|forum\w*)\b/i,
    recognition: 'Waiting can pull you back into searching, over and over.',
    grounding: {
      touch: 'If it feels comfortable, let both hands rest palm-down on a surface. Notice the temperature where your skin meets it.',
      see: 'Let your gaze travel to the furthest thing you can see. Follow its outline slowly, from one side to the other.',
      hear: 'Listen past whatever is closest to you. Notice one sound that was already there before you started listening.',
    },
  },
  {
    signal: /\b(sleep\w*|asleep|awake|insomnia|lying|lie|2am|3am|middle of the night)\b/i,
    recognition: 'Waiting can keep you awake long after you wanted to rest.',
    grounding: {
      touch: 'If you are lying down, notice the weight of your body where it presses into whatever is underneath you.',
      see: 'Let your eyes settle on the dimmest light you can find. Notice how its edges soften the longer you look.',
      hear: 'Listen for the quietest sound around you. Notice whether it holds steady or comes and goes.',
    },
  },
  {
    signal: /\b(can'?t stop|cannot stop|keep thinking|racing|spiral\w*|overthink\w*|jump\w*\s+ahead|imagin\w*|scenario\w*|what if)\b/i,
    recognition: 'Waiting can send your thoughts running a long way ahead of you.',
    grounding: {
      touch: 'Press your fingertips together one pair at a time. Notice the small pressure as each pair meets and lets go.',
      see: 'Choose one colour near you and find it three separate times. Let your eyes move slowly between them.',
      hear: 'Listen for the sound furthest away from you. Notice how it arrives softer than the ones nearby.',
    },
  },
  {
    signal: /\b(when|how long|timeline|timeframe|arrives?|arriving|call|calls|phone|letter|appointment)\b/i,
    recognition: 'Waiting without knowing when is its own kind of difficult.',
    grounding: {
      touch: 'If there is something with texture nearby, run your thumb slowly across it. Notice where it turns rough or smooth.',
      see: 'Find something in front of you that is completely still. Let your eyes trace its shape once, without hurrying.',
      hear: 'Listen to the sound closest to you right now. Notice whether it repeats or changes as you stay with it.',
    },
  },
]

/**
 * Sanitises the agent's organiser output. Returns null when nothing trustworthy remains,
 * so the caller can keep the predefined experience instead.
 * @param {unknown} value
 * @returns {{ labels: string[], suggestion: string|null, pattern: string|null, human_support: boolean }|null}
 */
export function validateOrganised(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  if (value.human_support === true) return { labels: [], suggestion: null, pattern: null, human_support: true }
  const canDo = Array.isArray(value.can_do) ? value.can_do : []
  const cannotKnow = Array.isArray(value.cannot_know) ? value.cannot_know : []
  if (canDo.length === 0 && cannotKnow.length === 0) return null

  const labels = [...cannotKnow, ...canDo]
    .map((item) => (item && typeof item === 'object' ? asText(item.label) : null))
    .filter((label) => label && label.length <= LIMITS.label)

  const rawSuggestion = canDo.map((item) => (item && typeof item === 'object' ? asText(item.suggestion) : null)).find(Boolean) ?? null
  const suggestion = rawSuggestion && rawSuggestion.length <= LIMITS.suggestion &&
    !clinical.test(rawSuggestion) && !reassurance.test(rawSuggestion) && !/[<>]/.test(rawSuggestion)
    ? rawSuggestion : null

  const rawPattern = asText(value.pattern)
  const pattern = rawPattern && !clinical.test(rawPattern) ? rawPattern : null
  return { labels, suggestion, pattern, human_support: false }
}

/**
 * The person's own words, taken verbatim from their text so the label stays extractive.
 * @returns {string|null}
 */
function verbatim(label, original) {
  const wanted = align(label).replace(/[.…\s]+$/, '')
  if (wanted.length < 8) return null
  const at = align(original).indexOf(wanted)
  return at === -1 ? null : original.slice(at, at + wanted.length)
}

/**
 * Builds the meditation the agent's reading of the text points to.
 * @param {ReturnType<typeof validateOrganised>} organised
 * @param {string} original
 * @returns {import('./grounding.mjs').GroundingExperience}
 */
export function composeExperience(organised, original) {
  const base = fallbackGrounding(original)
  if (!organised || organised.human_support) return base
  // The agent's own reading decides which loop this is, not just the raw text.
  const context = [original, organised.pattern ?? '', ...organised.labels].join(' ')
  const chosen = MEDITATIONS.find((meditation) => meditation.signal.test(context))
  const label = organised.labels.map((candidate) => verbatim(candidate, original)).find(Boolean)
  return {
    recognition: chosen?.recognition ?? base.recognition,
    thought_label: label ? thoughtExcerpt(label) : base.thought_label,
    grounding: chosen ? { ...chosen.grounding } : base.grounding,
  }
}

/** Second check for the one practical step, run again before it is rendered. */
export function acceptSuggestion(value) {
  const suggestion = asText(value)
  if (!suggestion || suggestion.length > LIMITS.suggestion) return null
  if (clinical.test(suggestion) || reassurance.test(suggestion) || /[<>]/.test(suggestion)) return null
  return suggestion
}

export const MEDITATION_VARIANTS = MEDITATIONS
