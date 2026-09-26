export type GroundingExperience = { recognition: string; thought_label: string; grounding: { touch: string; see: string; hear: string } }
export function thoughtExcerpt(text: string): string
export function fallbackGrounding(text: string): GroundingExperience
export function validateGrounding(value: unknown, original: string): GroundingExperience | null
