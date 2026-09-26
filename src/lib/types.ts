export type Invitations = {
  touch: string
  see: string
  hear: string
}

export type CanDoItem = { label: string; suggestion?: string }
export type CannotKnowItem = { label: string }
export type Analysis = { can_do: CanDoItem[]; cannot_know: CannotKnowItem[]; pattern?: string; human_support: boolean }
export type AnalysisSource = 'ai' | 'local'

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
