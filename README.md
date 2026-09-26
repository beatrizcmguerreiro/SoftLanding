SoftLanding is a quiet space for the moments between a medical test and its results. Write down a worry, watch it float away, and return to the present—without needing to have all the answers yet.

## What it is

A mobile-first web prototype in English that implements [`softlanding-plan-en.md`](softlanding-plan-en.md) using the visual direction in [`visual-style-guide-en.md`](visual-style-guide-en.md). The Portuguese originals are kept alongside them.

Flow: arrival → free writing → organisation into “Can do” / “Cannot know yet” → set a thought aside → return to the present → close. It does not interpret tests or give medical answers.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # tests for the local analysis, validation and safeguards
npm run build && npm start   # production server on http://localhost:4173
```

### Optional AI

With no configuration, everything works using the **local organisation** (fallback). To turn on the AI, set the key on the server only:

```bash
ANTHROPIC_API_KEY=... npm run dev     # or: npm run build && ANTHROPIC_API_KEY=... npm start
# optional: ANTHROPIC_MODEL=<model>
```

The key is only read in `server/analyze.mjs` and never reaches the browser. When the AI is on, the writing screen warns that the text is sent to an external service (Anthropic). Never commit `.env` files; they are ignored by `.gitignore`.

## What is real and what is simulated

- **Working:** all four screens plus the human-support state; deterministic local analysis; validation of AI output (schema, lengths, match against the person’s text, blocking of diseases/probabilities/treatments/false reassurance); drag gesture and “Set aside for now” button; keyboard, `aria-live`, `prefers-reduced-motion`.
- **Local and limited:** without AI, the text is split into the sentences and clauses the person wrote. It only recognises questions about *when/how the result arrives* (fixed logistical micro-action) and mentions of *searching* (caption). It does not assess severity.
- **Simple safeguards, not triage:** `needsHumanSupport` and `mentionsNewOrWorseningSymptoms` match obvious English (and some Portuguese) phrases. A public version would need clinical, privacy and safety review.
- **No data stored:** text lives only in memory and is cleared on exit. No localStorage, analytics, accounts or database.
- **Support contacts are for Portugal** (112 and SNS 24), as in the plan.
- **Deliberate schema deviation:** if the only thought is a practical question (e.g. “I don’t know when the result arrives”), “Cannot know yet” stays empty rather than inventing a thought.
