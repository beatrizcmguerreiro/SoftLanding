SoftLanding is a quiet space for the moments between a medical test and its results. Write down a worry, watch it float away, and return to the present—without needing to have all the answers yet.

## What it is

A mobile-first web prototype in English that implements [`softlanding-plan-en.md`](softlanding-plan-en.md) using the visual direction in [`visual-style-guide-en.md`](visual-style-guide-en.md). The Portuguese originals are kept alongside them.

Flow, in three screens: splash → the person writes (or dictates) what is worrying them → a personalised grounding experience. On the third screen a short recognition line appears, the person’s thought floats into the background as a balloon, and three sensory invitations (touch, see, hear) are shown one at a time with “Continue” or “Skip”, ending with “The thought can still be there. And so can you.” It does not answer the worry, interpret tests or give medical answers.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # tests for grounding validation, fallbacks and safeguards
npm run build && npm start   # production server on http://localhost:4173
```

### Optional AI

With no configuration, the third screen uses three **predefined invitations** (fallback). To have the AI write personalised invitations, set the key on the server only:

```bash
ANTHROPIC_API_KEY=... npm run dev     # or: npm run build && ANTHROPIC_API_KEY=... npm start
# optional: ANTHROPIC_MODEL=<model>
```

The key is only read in `server/analyze.mjs` and never reaches the browser. When the AI is on, the writing screen warns that the text is sent to an external service (Anthropic). Never commit `.env` files; they are ignored by `.gitignore`.

## What is real and what is simulated

- **Working:** the three screens plus the human-support state; server-side AI request (`POST /api/grounding`, temperature 0.8 so wording varies); validation of AI output in `src/lib/grounding.ts` (exactly `touch`/`see`/`hear`, at most two sentences and 140 characters each, no diagnoses, probabilities, treatments, test talk or false reassurance; a faithful thought label). If the invitations fail validation, all three are replaced by the predefined ones; the recognition line and label fall back individually. Keyboard, `aria-live`, `prefers-reduced-motion`.
- **Simple safeguards, not triage:** `shared/safety.mjs` matches obvious English (and some Portuguese) phrases about danger or new/worsening symptoms. It runs in the browser before anything is sent and again on the server before calling the model; the model can also set `human_support`. Any of these replaces the grounding with support contacts. A public version would need clinical, privacy and safety review.
- **No data stored:** text lives only in memory and is cleared when the grounding starts; only the short thought label stays on screen until “Close”. No localStorage, analytics, accounts or database. Use fictional concerns in demos.
- **Support contacts are for Portugal** (112 and SNS 24), as in the plan.
- **Schema addition:** the model’s JSON may include `"human_support": true`, which the server passes through as a flag and never as grounding.
