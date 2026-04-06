# Changelog

## v1.2.0 — Edit Last Message

### New Features
- **Edit last user message**: A pencil icon appears below the last user message in any brainstorm conversation. Tapping it opens the message for editing: the text is pre-filled in the input, an "Editing message" banner appears above it with a × dismiss button, and the send button turns into a checkmark. Sending replaces the original message and all subsequent messages, then re-sends to the AI — with the exact same conversation context chain it had at that point.

---

## v1.1.2 — Balance Fix & Reset Fix

### Bug Fixes
- **Correct credit balance**: Switched from `prepaid/balance` (only tracks purchases, not spending) to `postpaid/invoice/preview`. Balance is now `abs(prepaidCredits) - abs(prepaidCreditsUsed)`, matching the value shown in the xAI console exactly.
- **Reset preserves theme**: "Reset All Data" no longer resets the light/dark/system theme preference.

---

## v1.1.1 — Credit Balance, Real Streaming Fix

### Bug Fixes
- **Credit balance now works**: xAI's balance endpoint is part of the Management API (`management-api.x.ai`) and requires a separate Management Key — not the normal inference API key. Added a Management Key field to Settings. Once saved, credit balance is fetched and shown next to the Active chip.
- **Real token-by-token streaming**: The `fetch` API in React Native (Hermes engine) does not expose `response.body` as a ReadableStream, so the previous fallback buffered the entire response before rendering it all at once. Replaced with `XMLHttpRequest` whose `onprogress` event fires as each network chunk arrives, giving smooth incremental text rendering.

---

## v1.1.0 — Streaming, Thinking & Live Pricing

### New Features
- **SSE Streaming**: All AI responses now stream in real-time via Server-Sent Events. Text appears token-by-token as it's generated.
- **Thinking Indicator**: Animated 3-dot pulse while the model is processing, shown before the first token arrives.
- **Streaming Cursor**: Blinking ▍ cursor appended to messages while they're still being generated.
- **Live Model Pricing**: Model selection in Settings now shows real-time per-token pricing fetched from the xAI API.
- **API Key Health**: Settings displays a status chip (Active / Blocked / Disabled) for your API key, plus remaining credit balance.
- **Live Model List**: Models are validated against the xAI `/v1/language-models` endpoint at startup.

### Rebranding
- AI assistant avatar changed from "G" to "S" (Storyteller).
- "System Prompt" renamed to "Persona" throughout the app.
- Persona dialog icon updated to `account-edit-outline`.

### Bug Fixes
- Fixed "JSON Parse error: Unexpected character: e" when sending messages — caused by React Native (Hermes) lacking ReadableStream support; SSE responses are now parsed from full text as a fallback.
- Fixed model pricing only appearing for the first model — now also matches models by their API aliases.
- Removed unnecessary streaming toggle (streaming is always on).
- Extended reasoning-model tolerance by removing hard timeouts on the streaming path.


### New Features
- **SSE Streaming**: All AI responses now stream in real-time via Server-Sent Events. Text appears token-by-token as it's generated.
- **Thinking Indicator**: Animated 3-dot pulse while the model is processing, shown before the first token arrives.
- **Streaming Cursor**: Blinking ▍ cursor appended to messages while they're still being generated.
- **Live Model Pricing**: Model selection in Settings now shows real-time per-token pricing fetched from the xAI API.
- **API Key Health**: Settings displays a status chip (Active / Blocked / Disabled) for your API key, plus remaining credit balance.
- **Live Model List**: Models are validated against the xAI `/v1/language-models` endpoint at startup.

### Rebranding
- AI assistant avatar changed from "G" to "S" (Storyteller).
- "System Prompt" renamed to "Persona" throughout the app.
- Persona dialog icon updated to `account-edit-outline`.

### Bug Fixes
- Fixed "JSON Parse error: Unexpected character: e" when sending messages — caused by React Native (Hermes) lacking ReadableStream support; SSE responses are now parsed from full text as a fallback.
- Fixed model pricing only appearing for the first model — now also matches models by their API aliases.
- Removed unnecessary streaming toggle (streaming is always on).
- Extended reasoning-model tolerance by removing hard timeouts on the streaming path.
