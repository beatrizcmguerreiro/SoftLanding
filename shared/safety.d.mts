export function needsHumanSupport(text: string): boolean
export function mentionsNewOrWorseningSymptoms(text: string): boolean
export function supportReason(text: string): 'urgent' | 'symptoms' | null
