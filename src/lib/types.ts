export type Invitations = {
  touch: string
  see: string
  hear: string
}

export type GroundingContent = {
  recognition: string
  thought_label: string
  grounding: Invitations
}

export type SupportReason = 'urgent' | 'symptoms'

export type GroundingResult =
  | { kind: 'grounding'; content: GroundingContent }
  | { kind: 'support'; reason: SupportReason }

export type AppState = 'welcome' | 'write' | 'grounding' | 'human-support'
