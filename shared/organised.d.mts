import type { GroundingExperience } from './grounding.mjs'

export type Organised = {
  labels: string[]
  suggestion: string | null
  pattern: string | null
  human_support: boolean
}

export type MeditationVariant = {
  signal: RegExp
  recognition: string
  grounding: { touch: string; see: string; hear: string }
}

export const MEDITATION_VARIANTS: MeditationVariant[]
export function validateOrganised(value: unknown): Organised | null
export function composeExperience(organised: Organised | null, original: string): GroundingExperience
export function acceptSuggestion(value: unknown): string | null
