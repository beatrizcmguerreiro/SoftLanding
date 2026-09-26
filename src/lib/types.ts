export type CanDoItem = {
  label: string
  suggestion?: string
}

export type CannotKnowItem = {
  label: string
}

export type Analysis = {
  can_do: CanDoItem[]
  cannot_know: CannotKnowItem[]
  pattern?: string
  human_support: boolean
}

export type AnalysisSource = 'ai' | 'local'

export type AppState =
  | 'welcome'
  | 'write'
  | 'organizing'
  | 'organized'
  | 'grounding'
  | 'finished'
  | 'human-support'

export type SupportReason = 'urgent' | 'symptoms'
