import { describe, expect, it } from 'vitest'
import {
  FALLBACK_INVITATIONS,
  FALLBACK_RECOGNITION,
  LIMITS,
  acceptInvitation,
  localThoughtLabel,
  validateGrounding,
} from './grounding'
import { mentionsNewOrWorseningSymptoms, needsHumanSupport, supportReason } from './safety'
import { handleGrounding } from '../../server/analyze.mjs'

const DEMO = "What if the result is serious? I can't stop searching online."

const GOOD = {
  recognition: 'Not knowing yet can take up a lot of room.',
  thought_label: "I can't stop searching online",
  grounding: {
    touch: 'If it feels comfortable, set your phone down and touch a surface nearby. Notice its texture.',
    see: 'Look around. Find a small difference in colour or light.',
    hear: 'Listen for a moment. Is there a background sound you hadn’t noticed?',
  },
}

describe('validateGrounding', () => {
  it('accepts well-formed, safe output', () => {
    expect(validateGrounding(GOOD, DEMO)).toEqual(GOOD)
  })

  it('accepts the approved example invitations', () => {
    const examples = [
      'If it feels comfortable, notice where your body meets whatever is holding it up. Let your weight settle there for a moment.',
      'Look around you. Find one shape nearby and slowly follow its outline with your eyes.',
      'If there’s something within reach, hold it for a moment. Notice its weight in your hand.',
      'If you’re holding your phone, notice its weight and temperature. Then, if you like, set it down and feel your open hand.',
      'Listen for a few breaths. Notice one sound that is simply happening, right now.',
    ]
    examples.forEach((text) => expect(acceptInvitation(text)).toBe(text))
  })

  it('replaces all three invitations when one is unsafe', () => {
    const out = validateGrounding(
      { ...GOOD, grounding: { ...GOOD.grounding, see: 'Look around. You are safe and it’s nothing serious.' } },
      DEMO,
    )
    expect(out.grounding).toEqual(FALLBACK_INVITATIONS)
    expect(out.recognition).toBe(GOOD.recognition)
  })

  it('rejects clinical content, reassurance and test talk in invitations', () => {
    ;[
      'Just relax. Everything will be fine.',
      'Notice your breathing. Anxiety symptoms often feel like this.',
      'Touch something nearby. Most results like this are benign.',
      'Listen for a moment. The test is probably fine.',
    ].forEach((text) => expect(acceptInvitation(text)).toBeNull())
  })

  it('rejects invitations longer than two sentences or the length limit', () => {
    expect(acceptInvitation('Look around. Find a colour. Now find another.')).toBeNull()
    expect(acceptInvitation(`Listen ${'very '.repeat(40)}closely.`)).toBeNull()
  })

  it('requires exactly touch, see and hear, all distinct', () => {
    expect(validateGrounding({ ...GOOD, grounding: { touch: GOOD.grounding.touch, see: GOOD.grounding.see } }, DEMO).grounding).toEqual(
      FALLBACK_INVITATIONS,
    )
    expect(
      validateGrounding({ ...GOOD, grounding: { ...GOOD.grounding, extra: 'Breathe in.' } }, DEMO).grounding,
    ).toEqual(FALLBACK_INVITATIONS)
    const same = GOOD.grounding.see
    expect(validateGrounding({ ...GOOD, grounding: { touch: same, see: same, hear: same } }, DEMO).grounding).toEqual(
      FALLBACK_INVITATIONS,
    )
  })

  it('falls back when the recognition interprets the test', () => {
    const out = validateGrounding({ ...GOOD, recognition: 'It is probably nothing serious.' }, DEMO)
    expect(out.recognition).toBe(FALLBACK_RECOGNITION)
  })

  it('keeps the thought label faithful to the person’s words', () => {
    expect(validateGrounding({ ...GOOD, thought_label: 'It might be cancer' }, DEMO).thought_label).toBe(
      'What if the result is serious?',
    )
    expect(validateGrounding({ ...GOOD, thought_label: 'Worried about rare diseases' }, DEMO).thought_label).toBe(
      'What if the result is serious?',
    )
  })

  it('uses the full fallback for invalid shapes', () => {
    for (const raw of [null, 'text', { foo: 1 }]) {
      const out = validateGrounding(raw, DEMO)
      expect(out.grounding).toEqual(FALLBACK_INVITATIONS)
      expect(out.recognition).toBe(FALLBACK_RECOGNITION)
    }
  })

  it('fallback invitations pass their own validation', () => {
    Object.values(FALLBACK_INVITATIONS).forEach((text) => expect(acceptInvitation(text)).toBe(text))
  })
})

describe('localThoughtLabel', () => {
  it('uses the first sentence, shortened', () => {
    expect(localThoughtLabel(DEMO)).toBe('What if the result is serious?')
    const long = 'I keep lying awake at night going through every single possible outcome again and again'
    expect(localThoughtLabel(long).length).toBeLessThanOrEqual(LIMITS.label)
  })
})

describe('safety checks', () => {
  it('new or worsening symptoms', () => {
    expect(mentionsNewOrWorseningSymptoms('I have a new symptom')).toBe(true)
    expect(mentionsNewOrWorseningSymptoms('I feel worse since yesterday')).toBe(true)
    expect(mentionsNewOrWorseningSymptoms(DEMO)).toBe(false)
  })

  it('acute distress', () => {
    expect(needsHumanSupport('I want to hurt myself')).toBe(true)
    expect(needsHumanSupport('I don’t feel safe')).toBe(true)
    expect(needsHumanSupport('Não me sinto em segurança')).toBe(true)
    expect(needsHumanSupport(DEMO)).toBe(false)
    expect(supportReason('I want to hurt myself')).toBe('urgent')
    expect(supportReason('It is getting worse')).toBe('symptoms')
    expect(supportReason(DEMO)).toBeNull()
  })
})

describe('handleGrounding (server)', () => {
  it('routes to human support before calling the model, even without an API key', async () => {
    expect(await handleGrounding({ text: 'I want to hurt myself' }, {})).toEqual({
      status: 200,
      json: { human_support: true, reason: 'urgent' },
    })
    expect(await handleGrounding({ text: 'I have new symptoms' }, {})).toEqual({
      status: 200,
      json: { human_support: true, reason: 'symptoms' },
    })
  })

  it('reports unavailable when there is no key', async () => {
    expect((await handleGrounding({ text: DEMO }, {})).status).toBe(503)
  })
})
