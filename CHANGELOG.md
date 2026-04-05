# Changelog

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
