import { afterEach, describe, expect, it, vi } from 'vitest'
import { fallbackGrounding, validateGrounding } from '../../shared/grounding.mjs'
import { handleAnalyze } from '../../server/analyze.mjs'

const text = 'I keep searching online while I wait.'
const valid = () => fallbackGrounding(text)
afterEach(() => vi.unstubAllGlobals())

describe('grounding validation', () => {
  it('accepts exactly three short sensory invitations', () => {
    expect(validateGrounding(valid(), text)).toEqual(valid())
  })
  it('rejects missing/extra modalities and extra top-level fields', () => {
    expect(validateGrounding({ ...valid(), extra: 'x' }, text)).toBeNull()
    expect(validateGrounding({ ...valid(), grounding: { touch: 'Touch a surface.' } }, text)).toBeNull()
    expect(validateGrounding({ ...valid(), grounding: { ...valid().grounding, breathe: 'Breathe.' } }, text)).toBeNull()
  })
  it.each(['You are safe. Touch a surface.', 'Touch a surface; everything will be fine.', 'Touch a surface; the result is benign.', 'Touch a surface to cure your anxiety.', 'Touch a surface. Notice it. Feel it.', 'Tell me the texture.', 'Look at your window.'])('rejects unsafe or invalid invitation: %s', invitation => {
    const value = valid()
    value.grounding.touch = invitation
    expect(validateGrounding(value, text)).toBeNull()
  })
  it('rejects invented labels and clinical recognition', () => {
    expect(validateGrounding({ ...valid(), thought_label: 'I have cancer' }, text)).toBeNull()
    expect(validateGrounding({ ...valid(), recognition: 'Waiting means the result is normal.' }, text)).toBeNull()
  })
  it('rejects oversized output', () => {
    const value = valid()
    value.grounding.hear = 'Listen '.repeat(41)
    expect(validateGrounding(value, text)).toBeNull()
  })
})

describe('server grounding boundary', () => {
  it('falls back without an API key', async () => {
    expect((await handleAnalyze({ text }, {})).json).toEqual({ experience: valid(), source: 'local' })
  })
  it.each(['I want to hurt myself', 'I cannot breathe', 'My symptoms are worsening'])('routes to support before calling the model: %s', async concern => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    expect((await handleAnalyze({ text: concern }, { ANTHROPIC_API_KEY: 'fake' })).json).toHaveProperty('support')
    expect(fetch).not.toHaveBeenCalled()
  })
  it('accepts a validated model response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: [{ type: 'text', text: JSON.stringify(valid()) }] }) }))
    expect((await handleAnalyze({ text }, { ANTHROPIC_API_KEY: 'fake' })).json).toEqual({ experience: valid(), source: 'ai' })
  })
  it.each(['bad JSON', JSON.stringify({ ...valid(), recognition: 'You are safe while waiting.' })])('falls back for invalid output', async output => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: [{ type: 'text', text: output }] }) }))
    expect((await handleAnalyze({ text }, { ANTHROPIC_API_KEY: 'fake' })).json).toEqual({ experience: valid(), source: 'local' })
  })
  it('falls back on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect((await handleAnalyze({ text }, { ANTHROPIC_API_KEY: 'fake' })).json).toEqual({ experience: valid(), source: 'local' })
  })
  it('rejects empty and oversized input', async () => {
    expect((await handleAnalyze({ text: '' }, {})).status).toBe(400)
    expect((await handleAnalyze({ text: 'x'.repeat(601) }, {})).status).toBe(413)
  })
})
