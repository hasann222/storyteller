# Changelog

## [Unreleased] — 2026-04-10

### Rebrand — "Storyteller" → "Portal"

Full product rebrand across JS/TS, native Android, and assets.

#### Font
- Replaced `@expo-google-fonts/playfair-display` with `@expo-google-fonts/inter`.
- Weights used: `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold`.
- Updated `app/_layout.tsx` (import + `useFonts`), `src/theme/index.ts` (all 9 `fontFamily` values), `jest.setup.ts` (mock updated to Inter keys).

#### Color Scheme
- **Light:** primary `#C0784A` (warm peach), background `#F9F7F5`, surface `#FFFFFF`, secondary `#6E6179`, tertiary `#8B6E98`, outline `#D8D0DC`.
- **Dark:** primary `#F0A87C` (light peach), background `#151218` (cosmic purple-black), surface `#1E1A22`, secondary `#D0BFD9`.
- Splash background: `#1E1428` (deep cosmic purple).
- Updated `src/theme/index.ts`, `src/theme/dark.ts`, `__tests__/theme/theme.test.ts` (color assertions).

#### App Identity (JS/TS)
- `app.json`: name → `Portal`, slug → `portal`, scheme → `portal`, icon/splash/favicon → `portal.png`, splash `backgroundColor` → `#1E1428`.
- `package.json`: name → `portal`.
- All 5 Zustand persist keys: `storyteller-*` → `portal-*` (`settingsStore`, `projectStore`, `characterStore`, `sceneStore`, `chatStore`).
- `app/settings.tsx`: backup filename → `portal-backup.json`, export dialog title → `Export Portal Data`.
- `CHANGELOG.md`: historical "Storyteller" avatar references updated.

#### Android Native
- `android/app/build.gradle`: namespace + applicationId → `com.anonymous.portal`; `resValue "Portal-dev"` for debug, `resValue "Portal"` for release; `.standalone` applicationId suffix for release so both APKs coexist on device.
- `android/app/src/main/res/values/strings.xml`: removed hard-coded `app_name` (now driven by `resValue` per build type).
- `android/app/src/main/res/values/colors.xml`: splash/icon background → `#1E1428`, `colorPrimary` → `#C0784A`.
- `android/app/src/main/res/values/styles.xml`: `statusBarColor` → `#F9F7F5`.
- `android/app/src/main/AndroidManifest.xml`: deep link scheme `storyteller` → `portal`.
- `android/settings.gradle`: `rootProject.name` → `'Portal'`.
- Kotlin package directory renamed `storyteller/` → `portal/`; `package` declarations updated in `MainActivity.kt` + `MainApplication.kt`.

#### Icons & Assets
- New `assets/portal.png` (804×804 RGBA, transparent background).
- All mipmap WebP icons regenerated from `portal.png` (mdpi 48px → xxxhdpi 192px).
- Splash logo PNGs regenerated (mdpi 48px → xxhdpi 144px).
- `android/app/src/main/res/values/colors.xml` `iconBackground` → `#1E1428`.

#### Release Keystore
- New `android/app/release.keystore` generated with alias `portal-release`, password `portal2026`, validity 10 000 days.
- `android/keystore.properties` updated to reference new alias/password.

---

### Bug Fixes

- **SecureStore fails in release builds — all API key reads/writes throw** (`app/settings.tsx`, `android/app/proguard-rules.pro`)
  - **Root cause**: R8 minification renames fields of Kotlin data classes (e.g. `SecureStoreOptions`). `expo-modules-core` maps JS arguments onto these classes via reflection at runtime. With fields renamed, reflection returns `null` → `NullPointerException` → `"The Nth argument cannot be cast to type …"`. This affected every `getItemAsync`, `setItemAsync`, and `deleteItemAsync` call.
  - **Fix**: Added ProGuard keep rules for all `expo.modules.**` classes and class members so R8 does not rename their fields.

- **API key TextInput clears on every keystroke in release builds** (`app/settings.tsx`)
  - **Root cause**: `getApiKey()` / `getMgmtKey()` threw immediately (due to the R8 issue above), so the `.then()` block never ran and `apiKeyLoaded` / `mgmtKeyLoaded` stayed `false`. The `value` prop on the `TextInput` evaluated to `false ? apiKeyValue : ''` = `''` — every render overwrote what the user typed.
  - **Fix**: Moved `setApiKeyLoaded(true)` / `setMgmtKeyLoaded(true)` into `.finally()` so they always fire regardless of success or failure. Added `.catch()` handlers so exceptions don't surface as unhandled promise rejections.

- **Save button silently does nothing in release builds** (`app/settings.tsx`)
  - **Root cause**: `handleSaveApiKey` and `handleSaveMgmtKey` called `await setApiKey(…)` / `await setMgmtKey(…)` which threw (same R8 issue). The thrown error propagated past `setSnackbarVisible(true)`, so no feedback was shown and no key was stored.
  - **Fix**: Wrapped both handlers in `try/catch` so the snackbar always shows, and exceptions are caught cleanly. The underlying R8 fix is what makes the saves actually succeed.

---

## [Unreleased] — 2026-04-08

### Bug Fixes

- **Keyboard clips input bottom border in character creation and brainstorm screens** (`standard.tsx`, `interview.tsx`, `BrainstormChat.tsx`)
  - **Root cause (revised)**: The original fix subtracted `insets.bottom` (~14.9dp) from `e.endCoordinates.height` before storing as `keyboardPad`. On a full-screen view with no tab bar, this under-compensates by exactly the nav-bar inset height — causing the bottom border of the input to be hidden under the keyboard. `BrainstormChat` had the same bug but it was masked within a tab layout.
  - **Fix**: Use `e.endCoordinates.height` directly (no inset subtraction). When keyboard is hidden, fall back to `insets.bottom` so the nav-bar gap is preserved. Removed `lastBottomInsetRef` from all three files.
  - `standard.tsx` / `interview.tsx`: Replaced `KeyboardAvoidingView` on Android with a plain `<View style={{ paddingBottom: keyboardPad > 0 ? keyboardPad : insets.bottom }}>`. KAV is kept for iOS.
  - `BrainstormChat.tsx`: Updated to the same calculation; added 8dp top/bottom padding wrapper around `ChatInput` to match the other screens.

- **Keyboard still clips ChatInput bottom border in BrainstormChat** (`src/components/BrainstormChat.tsx`)
  - **Root cause**: `BrainstormChat` lives inside the bottom tab layout, so the full `e.endCoordinates.height` overshoots by the tab bar height (~78dp). The exact overlap needed is `containerBottom − e.endCoordinates.screenY`, but this value was pre-stored in `onLayout` before the keyboard appeared; a timing race could leave it as 0 on first keyboard raise.
  - **Fix**: Call `measureInWindow` *inside* both `keyboardDidShow` and `keyboardWillShow` callbacks so the container position is always current when padding is calculated. Buffer of +24dp (`overlap + 24`) confirmed via device measurement (SM_M346B: `containerBottom=798.1, kbY=548.2, inputWrapper bottom=524.6, gap=23.6dp`) to give a comfortable clearance above the keyboard action bar.

- **Character card sex field inconsistent capitalisation** (`src/components/CharacterCard.tsx`)
  - The AI sometimes returns "Female", sometimes "female". Normalised to title-case at render time: `sex.charAt(0).toUpperCase() + sex.slice(1).toLowerCase()`.

- **Keyboard hides Settings Save button on first tap** (`app/settings.tsx`)
  - Added `keyboardShouldPersistTaps="handled"` to the settings `ScrollView` so tapping Save while the keyboard is open fires the action immediately instead of first dismissing the keyboard.

- **Brainstorm ↔ Script tab switcher: swipe gesture** (`app/project/[id]/(tabs)/index.tsx`)
  - Removed `scrollEnabled={false}` from the horizontal pager `ScrollView`. Added `onMomentumScrollEnd` to sync the `SegmentedButtons` highlight when the user swipes between tabs.



- **Settings — API / Management key inputs clear on every keystroke** (`app/settings.tsx`)
  - **Root cause**: The `useEffect` that loaded the saved key from SecureStore listed `refreshKeyHealth` in its dependency array. `refreshKeyHealth` itself depended on `setCachedTeamId` from the Zustand store. When `refreshKeyHealth` ran on mount it called `setCachedTeamId(info.team_id)`, which updated the store, which re-rendered the component. Depending on reference stability, this could re-create the `refreshKeyHealth` callback, causing the `useEffect` to fire a second time — calling `setApiKeyValue(savedKey)` and overwriting whatever the user had just typed.
  - **Fix**: Merged both key-loading effects into a single mount-only `useEffect(fn, [])`. `refreshKeyHealth` is accessed through a `useRef` that is updated synchronously on every render, so the latest version is always called without it being a reactive dependency.

- **Character portraits not showing** (`src/api/xai.ts`)
  - Corrected image model name from `grok-2-image` → `grok-imagine-image`.
  - Verified end-to-end on device: HTTP 200, base64 received, file written, portrait rendered.

- **Silent image generation failure** (`src/hooks/useCharacterCreation.ts`)
  - Restored a safe silent catch so character creation still succeeds without a portrait if the API fails.

---

## [Unreleased] — 2026-04-07

### Bug Fixes

- **Routing — Unmatched Route on Characters tab** (`app/project/[id]/(tabs)/characters.tsx`)
  - Changed `useLocalSearchParams` → `useGlobalSearchParams` for the `id` param.
  - Lazy-mounted Tabs screens do not receive params through the local context; the global params hook is required to read dynamic segment values in this layout.

- **Character detail — unused `projectId` variable** (`app/project/[id]/character/[charId].tsx`)
  - Removed the now-redundant `id` extraction from `useLocalSearchParams`.
  - `CharacterCopySheet` now receives `currentProjectId` from `character.projectId` (the store object) rather than a dangling variable — fixes `TS2304: Cannot find name 'projectId'`.

- **Standard creation screen — unused import** (`app/project/[id]/character/standard.tsx`)
  - Removed `ActivityIndicator` from the `react-native-paper` import (no longer used after refactor).

- **Character creation hook — unused catch bindings** (`src/hooks/useCharacterCreation.ts`)
  - Changed `catch (err)` → `catch` in all three creation paths. Error object was never referenced in any catch body.

### Code Quality — Cleanup

- Removed all 25 debug `console.log` statements across 11 source files left over from development.
- Dead/unreachable code paths removed from the same files.

### Testing — Full Unit Test Suite

Added a complete Jest-based unit and integration test suite. **236 tests across 27 suites, all passing.**

#### Infrastructure

| File | Purpose |
|---|---|
| `jest.config.js` | Jest config using `jest-expo` preset; `moduleNameMapper` for `@/*`, AsyncStorage, and `@expo/vector-icons`; `transformIgnorePatterns` for all Expo/RN ESM packages |
| `jest.setup.ts` | 20 mock sections for all native modules (SecureStore, Crypto, Haptics, FileSystem, expo-router, Clipboard, Reanimated, Paper, XMLHttpRequest, etc.) |
| `__mocks__/expo-vector-icons.js` | Unified no-op mock for `@expo/vector-icons` and all sub-path imports |
| `__tests__/helpers/factories.ts` | `makeProject`, `makeCharacter`, `makeScene`, `makeChatMessage`, `makeInterviewMessage`, `makeCharacterExtraction`, `resetIdCounter` |
| `__tests__/helpers/render.tsx` | `renderWithProviders()` — wraps in `PaperProvider` with app theme |
| `__tests__/helpers/store.ts` | `resetAllStores()` — resets all 6 Zustand stores via `getInitialState()` |

#### Test Suites

| Suite | Tests |
|---|---|
| `utils/id` | 3 |
| `utils/imageStorage` | 6 |
| `stores/projectStore` | 18 |
| `stores/characterStore` | 14 |
| `stores/sceneStore` | 15 |
| `stores/settingsStore` | 18 |
| `stores/chatStore` | 12 |
| `stores/interviewStore` | 8 |
| `api/xai` | 20 |
| `hooks/useCharacterCreation` | 9 |
| `components/AvatarInitials` | 5 |
| `components/EmptyState` | 3 |
| `components/ThinkingBubble` | 3 |
| `components/ChatBubble` | 8 |
| `components/ChatInput` | 9 |
| `components/CharacterCard` | 4 |
| `components/ProjectCard` | 4 |
| `components/GenrePicker` | 4 |
| `components/CreationModeSheet` | 6 |
| `components/CharacterLoadingOverlay` | 3 |
| `theme/theme` | 9 |
| **Unit total** | **182** |

#### Integration Tests (added in same session)

Added 6 integration test files that cover full user flows using `renderWithProviders` + real Zustand stores.

| Suite | Tests |
|---|---|
| `integration/ProjectHub` | 10 |
| `integration/NewProject` | 8 |
| `integration/CharactersScreen` | 10 |
| `integration/StandardCreation` | 9 |
| `integration/Settings` | 9 |
| `integration/ChatFlow` | 8 |
| **Integration total** | **54** |
| **Grand total** | **236** |

Additional helpers added for integration tests:

| File | Purpose |
|---|---|
| `__tests__/helpers/api.ts` | `mockFetchSuccess()`, `mockFetchError()`, `mockFetchNetworkError()` — fetch mock factories |
| `__tests__/helpers/navigation.ts` | `getMockRouter()` — expo-router push/replace/back mock |

#### Notable decisions

- `@expo/vector-icons` mocked via `moduleNameMapper` (not `jest.mock()`) — sub-path exports cannot be resolved by Jest at setup-file initialisation time.
- `console.warn` spy captures the original function before `jest.spyOn` to prevent infinite recursion.
- `ChatBubble` button queries filter `UNSAFE_getAllByProps({ hitSlop: 6 })` by `typeof onPress === 'function'` — each `Pressable` spawns multiple host elements all inheriting `hitSlop`.
- `CharacterLoadingOverlay` null-render tested via `queryByText(...)` not `toJSON()` — the Provider wrapper is always present in the JSON tree.
- Fake timers in `ChatBubble` tests flush the 1 500 ms copy-confirmation `setTimeout`.

### Dependencies Added

| Package | Version | Type |
|---|---|---|
| `@testing-library/react-native` | `^13.3.3` | devDep |
| `@testing-library/jest-native` | `^5.4.3` | devDep |
| `jest` | `^29.7.0` | devDep |
| `jest-expo` | `^55.0.14` | devDep |
| `react-test-renderer` | `^19.1.0` | devDep |
| `@types/jest` | `^29.x` | devDep |

### Configuration

- **`package.json`** — Added `test`, `test:watch`, `test:coverage` scripts.
- **`tsconfig.json`** — Added `"types": ["jest", "node"]` so the TS compiler recognises Jest globals (`describe`, `it`, `expect`) and Node.js globals (`global`) across all test files.

### Repository Cleanup

- Removed `DEVICE_RUN_CHANGELOG.md` (a per-session dev run log that had no ongoing value).
- Deleted 4 zero-byte garbage files accidentally created from terminal output (`Dialog\``, `controller.abort()`, `s.characters\``, `void\``).
- Added `screenshot1.png` cleanup.

---

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
- AI assistant avatar changed from "G" to "P" (Portal).
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
- AI assistant avatar changed from "G" to "P" (Portal).
- "System Prompt" renamed to "Persona" throughout the app.
- Persona dialog icon updated to `account-edit-outline`.

### Bug Fixes
- Fixed "JSON Parse error: Unexpected character: e" when sending messages — caused by React Native (Hermes) lacking ReadableStream support; SSE responses are now parsed from full text as a fallback.
- Fixed model pricing only appearing for the first model — now also matches models by their API aliases.
- Removed unnecessary streaming toggle (streaming is always on).
- Extended reasoning-model tolerance by removing hard timeouts on the streaming path.
