import type { IncomingMessage, ServerResponse } from 'node:http'

export const SYSTEM_PROMPT: string
export function aiEnabled(env?: NodeJS.ProcessEnv): boolean
export function handleGrounding(body: unknown, env?: NodeJS.ProcessEnv): Promise<{ status: number; json: unknown }>
export function apiMiddleware(
  env?: NodeJS.ProcessEnv,
): (req: IncomingMessage, res: ServerResponse, next: () => void) => Promise<void>
