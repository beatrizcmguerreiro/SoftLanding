export const MAX_AUDIO_BYTES: number
export function speechEnabled(env?: NodeJS.ProcessEnv): boolean
export function agentEnabled(env?: NodeJS.ProcessEnv): boolean
export function transcribe(
  audio: Uint8Array,
  contentType: string,
  env?: NodeJS.ProcessEnv,
): Promise<string | null>
export function synthesize(
  text: string,
  env?: NodeJS.ProcessEnv,
): Promise<{ audio: Uint8Array; contentType: string } | null>
export function askAgent(
  text: string,
  env?: NodeJS.ProcessEnv,
  options?: { timeoutMs?: number },
): Promise<Record<string, unknown> | null>
