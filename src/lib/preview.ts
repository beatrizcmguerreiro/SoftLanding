import { DEMO_TEXT } from '../screens/Write'
import { composeExperience } from '../../shared/organised.mjs'
import type { GroundingExperience } from '../../shared/grounding.mjs'
import type { SupportReason } from './types'

export type PreviewScreen = 'welcome' | 'feeling' | 'write' | 'grounding' | 'support'

export type PreviewCommand = {
  screen?: PreviewScreen
  feeling?: string
  text?: string
  step?: number
  suggestion?: string | null
  support?: SupportReason
  animate?: boolean
  reset?: boolean
}

const SCREENS: PreviewScreen[] = ['welcome', 'feeling', 'write', 'grounding', 'support']

export function readPreview(): PreviewCommand {
  const query = new URLSearchParams(window.location.search)
  const screen = query.get('screen')
  const step = Number(query.get('step') ?? '')
  return {
    screen: SCREENS.includes(screen as PreviewScreen) ? screen as PreviewScreen : undefined,
    feeling: query.get('feeling') ?? undefined,
    text: query.get('text') ?? undefined,
    step: Number.isFinite(step) ? Math.min(3, Math.max(0, step)) : undefined,
    suggestion: query.has('suggestion') ? query.get('suggestion') : undefined,
    support: query.get('support') === 'symptoms' ? 'symptoms' : query.get('support') === 'urgent' ? 'urgent' : undefined,
    animate: query.get('type') === '1',
  }
}

export function previewExperience(text = DEMO_TEXT): GroundingExperience {
  return composeExperience({ labels: [], suggestion: null, pattern: null, human_support: false }, text)
}

export function onPreviewCommand(apply: (command: PreviewCommand) => void) {
  const receive = (event: MessageEvent) => {
    if (event.data?.type !== 'softlanding-demo') return
    apply(event.data as PreviewCommand)
  }
  window.addEventListener('message', receive)
  window.parent?.postMessage({ type: 'softlanding-ready' }, '*')
  return () => window.removeEventListener('message', receive)
}
