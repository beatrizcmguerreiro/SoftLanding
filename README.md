# SoftLanding

A quiet three-screen demo for the wait between a medical test and its results. It offers sensory grounding, never medical answers.

## Flow

1. Splash screen.
2. Write or dictate a fictional concern. Dictation is available in browsers with speech recognition; typing and device dictation remain alternatives.
3. One grounding scene: a brief acknowledgement, a gently receding thought balloon, a soft light, and one invitation at a time in touch → see → hear order.

“I did it” and “Skip” advance. “Go back” revisits the previous invitation, or returns to writing from the first. Nothing advances automatically. The final message is exactly “The thought can still be there. And so can you.” Close clears the session and returns to the splash screen.

## Run

```sh
npm install
npm run dev
npm test
npm run build
npm start
```

Development runs at http://localhost:5173; production runs at http://localhost:4173.

On this Windows demo machine, if Node is not on PATH, run from the project directory:

```powershell
& "C:\Users\beatr\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules/vite/bin/vite.js
```

## AI and fallback

Set `ANTHROPIC_API_KEY` in the server environment or an ignored local `.env` for Vite. Optional: `ANTHROPIC_MODEL`. Restart the dev server after changing configuration. The production server reads environment variables. Never prefix a secret with `VITE_` or commit it.

`POST /api/grounding` calls Anthropic server-side. The requested model JSON is:

```json
{"recognition":"string","thought_label":"string","grounding":{"touch":"string","see":"string","hear":"string"}}
```

The server returns `{ experience, source }`, or `{ support: "urgent" | "symptoms" }`. `GET /api/status` reports whether a server key is configured, not whether the upstream service is healthy.

Shared validation checks exact keys, three distinct modalities, sensory language, sentence and word limits, faithful extractive labels, and prohibited clinical/reassurance language. Rejected output, timeouts and unavailable APIs use three predefined invitations. These conservative text checks cannot guarantee the absence of every possible unsafe semantic claim. Personalisation is prompt-driven and requires a working API key; the fallback intentionally does not pretend to be generated.

## Privacy and support

Use fictional concerns for the demo. Text is held only in memory, never logged or saved by this app, and cleared on Close or support routing. AI generation sends text to Anthropic. Browser dictation may use an external speech service; the writing screen discloses both. This app does not control those providers’ retention policies.

Simple English and Portuguese phrase checks run before generation on both client and server. Immediate-danger or new/worsening-symptom matches route to human support instead of grounding. These checks are limited safeguards, not clinical triage. Support contacts are explicitly for Portugal (112 and SNS 24).

## Verification

`npm test` covers schema validation, prohibited claims, fallback, server failures and support routing. Browser checks cover the three-screen flow, forward/back/skip, final copy, clearing on Close, support routing, and the mobile scene. Live microphone and live model output require manual verification with the relevant permissions and server key.
