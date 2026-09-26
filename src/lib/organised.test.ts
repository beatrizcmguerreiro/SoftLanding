import { afterEach, describe, expect, it, vi } from 'vitest'
import { fallbackGrounding, validateGrounding } from '../../shared/grounding.mjs'
import { MEDITATION_VARIANTS, acceptSuggestion, composeExperience, validateOrganised } from '../../shared/organised.mjs'
import { handleAnalyze } from '../../server/analyze.mjs'
import * as elevenlabs from '../../server/elevenlabs.mjs'

const text = 'I keep searching online at night and I cannot stop thinking about when the result arrives.'
const agentReply = (overrides: Record<string, unknown> = {}) => ({
  can_do: [{ label: 'I keep searching online at night', suggestion: 'Confirm when and how the result will be communicated' }],
  cannot_know: [{ label: 'I cannot stop thinking about when the result arrives' }],
  pattern: 'I feel like searching again',
  human_support: false,
  ...overrides,
})

describe('pre-approved meditations', () => {
  it.each(MEDITATION_VARIANTS)('passes the grounding validator: $recognition', variant => {
    const experience = { recognition: variant.recognition, thought_label: 'I keep searching online', grounding: { ...variant.grounding } }
    expect(validateGrounding(experience, text)).toEqual(experience)
  })
})

describe('agent output validation', () => {
  it('keeps the labels, the one practical step and the pattern', () => {
    expect(validateOrganised(agentReply())).toEqual({
      labels: ['I cannot stop thinking about when the result arrives', 'I keep searching online at night'],
      suggestion: 'Confirm when and how the result will be communicated',
      pattern: 'I feel like searching again',
      human_support: false,
    })
  })
  it('reports the human support flag without any content', () => {
    expect(validateOrganised(agentReply({ human_support: true }))).toEqual({ labels: [], suggestion: null, pattern: null, human_support: true })
  })
  it.each([
    'Ask your doctor about the treatment options',
    'It is probably nothing, so try to relax',
    'There is only a 5% risk, so stop searching',
    'You will have the result in 3 days',
  ])('drops a clinical or reassuring step: %s', suggestion => {
    expect(validateOrganised(agentReply({ can_do: [{ label: 'I keep searching online at night', suggestion }] }))?.suggestion).toBeNull()
    expect(acceptSuggestion(suggestion)).toBeNull()
  })
  it.each([null, 'text', {}, { can_do: [], cannot_know: [] }])('rejects unusable output: %s', value => {
    expect(validateOrganised(value)).toBeNull()
  })
})

describe('composing the meditation', () => {
  it('follows the loop the agent recognised and stays inside the grounding rules', () => {
    const experience = composeExperience(validateOrganised(agentReply()), text)
    expect(experience.recognition).toBe(MEDITATION_VARIANTS[0].recognition)
    expect(experience.grounding).toEqual(MEDITATION_VARIANTS[0].grounding)
    expect(validateGrounding(experience, text)).toEqual(experience)
  })
  it('uses the agent label verbatim so the thought stays in the person’s words', () => {
    const experience = composeExperience(validateOrganised(agentReply()), text)
    expect(text).toContain(experience.thought_label)
  })
  it('ignores a label the person never wrote', () => {
    const organised = validateOrganised(agentReply({ cannot_know: [{ label: 'I am afraid of a tumour' }], can_do: [] }))
    const experience = composeExperience(organised, text)
    expect(experience.thought_label).toBe(fallbackGrounding(text).thought_label)
  })
  it('keeps the predefined invitations when no loop is recognised', () => {
    const quiet = 'I am unsure how to describe this.'
    const organised = validateOrganised({ can_do: [], cannot_know: [{ label: 'I am unsure how to describe this' }], human_support: false })
    expect(composeExperience(organised, quiet)).toEqual({ ...fallbackGrounding(quiet), thought_label: 'I am unsure how to describe this' })
  })
  it.each([
    ['I cannot sleep, I am awake at 3am thinking about it', 1],
    ['I keep imagining every scenario and I cannot stop', 2],
    ['I do not know when the result arrives or who will call', 3],
  ])('matches the loop in %s', (input, index) => {
    const organised = validateOrganised({ can_do: [], cannot_know: [{ label: input.slice(0, 60) }], human_support: false })
    expect(composeExperience(organised, input).recognition).toBe(MEDITATION_VARIANTS[index].recognition)
  })
})

describe('server agent boundary', () => {
  const env = { ELEVENLABS_AGENT_ID: 'agent_test' }
  const askAgent = (reply: unknown) => vi.spyOn(elevenlabs, 'askAgent').mockResolvedValue(reply as never)
  afterEach(() => vi.restoreAllMocks())

  it('accepts an agent prompted for the grounding schema directly', async () => {
    const experience = { recognition: MEDITATION_VARIANTS[0].recognition, thought_label: 'I keep searching online', grounding: { ...MEDITATION_VARIANTS[0].grounding } }
    askAgent(experience)
    expect((await handleAnalyze({ text }, env)).json).toEqual({ experience, source: 'agent' })
  })

  it('serves the composed meditation and the practical step', async () => {
    askAgent(agentReply())
    expect((await handleAnalyze({ text }, env)).json).toEqual({
      experience: composeExperience(validateOrganised(agentReply()), text),
      suggestion: 'Confirm when and how the result will be communicated',
      source: 'agent',
    })
  })
  it('routes to support when the agent raises the flag', async () => {
    askAgent(agentReply({ human_support: true }))
    expect((await handleAnalyze({ text }, env)).json).toEqual({ support: 'urgent' })
  })
  it.each([null, { can_do: [], cannot_know: [] }])('falls back on unusable output: %s', async reply => {
    askAgent(reply)
    expect((await handleAnalyze({ text }, env)).json).toEqual({ experience: fallbackGrounding(text), source: 'local' })
  })
  it('never reaches the agent for texts that need a person', async () => {
    const spy = askAgent(agentReply())
    expect((await handleAnalyze({ text: 'I want to hurt myself' }, env)).json).toEqual({ support: 'urgent' })
    expect(spy).not.toHaveBeenCalled()
  })
})
