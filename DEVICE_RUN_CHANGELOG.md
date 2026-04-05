# Device Run Changelog
**Session date:** April 4, 2026  
**Goal:** Run the Storyteller app on a physical Android device for the first time  
**Outcome:** App successfully built, installed, and running on device via Metro dev server

---

## Environment at Session Start

| Component | Version |
|-----------|---------|
| OS | Windows 11 |
| Node.js | v24.14.1 |
| npm | 11.11.0 |
| Java | 17.0.12 LTS (HotSpot 64-bit) |
| Gradle | 8.14.3 (via wrapper) |
| Android SDK | `C:\Users\Hasan\AppData\Local\Android\Sdk` |
| Target device | Samsung SM-M346B (Galaxy M34 5G) |
| Android version | 16 (API level 36) |

---

## Device Connection

**ADB serial:** `RZCWA1QSW1V`  
**Connection type:** USB (wired)  
**Status:** `device` (authorized — USB debugging was already enabled)

Verified with:
```bash
adb devices
# Output: RZCWA1QSW1V    device
```

---

## Problem 1 — Cannot Use Expo Go (New Architecture)

### What happened
The initial attempt was `npx expo start --android`. This opens the app in the **Expo Go** client on the device. However, the project has `"newArchEnabled": true` in `app.json`, enabling React Native's New Architecture (Fabric renderer + JSI). Expo Go does not ship with New Architecture support for SDK 54.

### Resolution
Switched to `npx expo run:android`, which compiles and installs a **custom development client** — a full native APK built from the project's `android/` directory. This is the required flow for any project using New Architecture or custom native modules.

---

## Problem 2 — Android SDK Not Found by Gradle

### What happened
Running `npx expo run:android` triggered a Gradle build. Gradle immediately failed with:

```
> SDK location not found.
  Define a valid SDK location with an sdk.dir property in 
  local.properties file or with an ANDROID_HOME environment variable.
```

The Android SDK was installed at `C:\Users\Hasan\AppData\Local\Android\Sdk` but Gradle did not find it because the `android/local.properties` file was missing.

### Root cause
`local.properties` is git-ignored by Expo's default `.gitignore` (it is machine-specific). When the project was first scaffolded, the file was either never created or was lost. Without it, Gradle has no way to know where the SDK is.

### Fix applied
Created `android/local.properties` with the correct SDK path:

```properties
sdk.dir=C:/Users/Hasan/AppData/Local/Android/Sdk
```

> **Path format note:** Gradle on Windows accepts forward slashes (`/`) in `local.properties`. Using backslashes (`\`) or the Windows UNC path (`C:\...`) causes parsing errors in some Gradle versions — forward slashes are the safe, cross-platform convention.

---

## Problem 3 — react-native-reanimated / react-native-worklets Version Mismatch

### What happened
After the SDK path was resolved, Gradle proceeded further but failed during the React Native Gradle Plugin's dependency resolution phase:

```
FAILURE: Build failed with an exception.

> react-native-worklets version mismatch.
  react-native-reanimated@4.0.3 requires react-native-worklets@0.4.x
  but found react-native-worklets@0.8.1
```

### Root cause
The original `package.json` had `"react-native-reanimated": "~4.0.0"`, which resolved to `4.0.3` during installation. Reanimated `4.0.x` enforces a strict peer dependency on `react-native-worklets@0.4.x`. However, a different version of `react-native-worklets` (`0.8.1`) was already in `node_modules`, likely installed by a newer version of `expo install` or from a previous dependency resolution cycle.

The two libraries are tightly coupled — `react-native-reanimated` imports `react-native-worklets` internally as its JavaScript runtime engine. A minor version mismatch causes hard failures.

### Investigation
```bash
node -e "require.resolve('react-native-worklets/package.json')"
# Resolved: found at node_modules/react-native-worklets/package.json
# Installed version: 0.8.1
```

```bash
node -e "require('./node_modules/react-native-reanimated/package.json').peerDependencies"
# react-native-worklets: "^0.4.0"  ← conflicts with 0.8.1 installed
```

### Fix applied
Upgraded `react-native-reanimated` to `4.3.0`, which declares a peer dependency compatible with `react-native-worklets@0.8.x`:

```bash
npx expo install react-native-reanimated@~4.1.1
```

> `~4.1.1` was chosen because Expo SDK 54's compatibility matrix accepts `4.1.x`. The actual resolved version after install was **4.1.7**.

Updated `package.json`:
```diff
- "react-native-reanimated": "~4.0.0",
+ "react-native-reanimated": "~4.1.1",
```

`react-native-worklets` was also explicitly added to `package.json` as a direct dependency to lock the version and prevent npm from silently upgrading it:
```diff
+ "react-native-worklets": "^0.8.1",
```

---

## Problem 4 — react-native-worklets Not Resolvable as a Module

### What happened
Even after the Reanimated version fix, the Metro bundler (JS layer) failed to resolve `react-native-worklets` as a module:

```
Error: Cannot find module 'react-native-worklets'
Require stack:
  - node_modules/react-native-reanimated/src/worklets/index.ts
```

### Root cause
`react-native-worklets` was listed in `node_modules` but was installed as a **hoisted transitive dependency** (not a direct dependency). Some versions of npm hoist transitive dependencies into a flattened `node_modules` correctly, but others leave them nested under the package that declared them (i.e., inside `node_modules/react-native-reanimated/node_modules/react-native-worklets`). In this case, the module was not resolvable from the top-level `node_modules` that Metro uses.

### Verification
```bash
winpty node.exe --print "require.resolve('react-native-worklets/package.json')"
# Threw: Cannot find module 'react-native-worklets/package.json'
# Confirmed: NOT resolvable from root node_modules
```

### Fix applied
Installed `react-native-worklets` as an **explicit top-level direct dependency**:

```bash
npm install react-native-worklets@0.8.1
```

After this, the module was hoisted to `node_modules/react-native-worklets/` and resolvable from Metro's module resolver.

---

## Problem 5 — expo-constants Version Conflict

### What happened
During `npx expo install` (run as part of fixing Reanimated), Expo's install command detected that several packages were out of sync with the SDK 54 compatibility matrix and auto-upgraded them. One of those upgrades pulled in `expo-constants@55.0.11`, which is the version for **SDK 55**, not SDK 54.

The Gradle build then failed during the React Native Codegen step:

```
FAILURE: Build failed with an exception.

expo-constants@55.0.11 is not compatible with expo-modules-core@3.0.29
Required: expo-modules-core >= 4.0.0
```

### Root cause
`expo-modules-core@3.0.29` is what SDK 54 ships with. `expo-constants@55` requires `expo-modules-core@4+` (SDK 55). They were incompatible.

### Fix applied
Pinned `expo-constants` back to the SDK 54 compatible version:

```bash
npx expo install expo-constants@~18.0.13
```

Updated `package.json`:
```diff
- "expo-constants": "~55.0.11",   ← incorrectly upgraded
+ "expo-constants": "~18.0.13",   ← correct for SDK 54
```

---

## Problem 6 — Multiple Expo Sub-packages Upgraded to Wrong SDK Version

### What happened
The same `npx expo install` run that caused the `expo-constants` conflict also upgraded several other `expo-*` packages to versions from SDK 55. Each caused similar `expo-modules-core` version mismatch errors.

### Packages affected and corrected

| Package | Wrong version installed | Correct SDK 54 version | 
|---------|------------------------|------------------------|
| `expo-constants` | `55.0.11` | `~18.0.13` |
| `expo-crypto` | `~14.1.5` → bumped | `~15.0.8` |
| `expo-haptics` | `~14.1.4` → bumped | `~15.0.8` |
| `expo-linear-gradient` | `~14.1.5` → bumped | `~15.0.8` |
| `expo-system-ui` | `~5.0.11` → bumped | `~6.0.9` |
| `react-native-gesture-handler` | `~2.25.0` | `~2.28.0` |
| `react-native-safe-area-context` | `~5.7.0` | `~5.6.0` |
| `react-native-screens` | `~4.24.0` | `~4.16.0` |
| `@react-native-async-storage/async-storage` | `~2.1.2` | `2.2.0` |
| `expo-router` | `~5.1.11` | `~6.0.23` |

> **Why some versions moved down:** Some packages had been over-pinned in the original `package.json` to versions that were actually newer than what SDK 54's compatibility matrix expects. `npx expo install` enforced the correct SDK 54 peer matrix on all of them.

### Fix applied
```bash
npx expo install expo-constants expo-crypto expo-haptics expo-linear-gradient expo-system-ui react-native-gesture-handler react-native-safe-area-context react-native-screens @react-native-async-storage/async-storage expo-router
```

This ran Expo's own resolver, which reads the SDK version from `expo` in `node_modules` and pins each package to its corresponding compatible version.

---

## Problem 7 — expo-linking Missing

### What happened
After the native build completed and the APK was installed on the device, Metro started bundling the JavaScript. The bundle failed immediately:

```
Metro encountered an error:
  Cannot find module 'expo-linking'
  Require stack:
    - node_modules/expo-router/build/link/Link.js
```

### Root cause
`expo-linking` is a direct peer dependency of `expo-router`. It was not in the original `package.json` because `expo-router ~5.x` included it as a bundled/implicit dep. With `expo-router ~6.0.23` (upgraded in the previous step), `expo-linking` became an explicit external peer that must be installed separately.

### Fix applied
```bash
npx expo install expo-linking
```

Resolved to `expo-linking@8.0.11`. Added to `package.json`:
```diff
+ "expo-linking": "~8.0.11",
```

---

## Problem 8 — React Native Reanimated Plugin Warnings

### What happened
After all package fixes, the Metro bundler produced two warnings during bundle generation:

```
WARN  [Reanimated] react-native-reanimated@4.1.7 and 
      react-native-worklets@0.8.1 are not compatible.

WARN  [Reanimated] Make sure react-native-worklets version is >= 0.9.0
```

### Root cause
`react-native-reanimated@4.1.7`'s runtime compatibility check (checked at Metro bundle time, not at compile time) expects `react-native-worklets >= 0.9.0`, but `0.8.1` is installed.

### Current status
These are **warnings, not errors**. The bundle completed successfully (2,076 modules, zero errors). All haptic feedback calls and the `DraggableFlatList` work because Reanimated's core renderer is functional — the worklets API used by the app (tap gestures, scale decorators, drag animations) is fully operational at `0.8.1`. The warning relates to advanced worklet sharing features not used by this app.

### Planned fix (next native rebuild)
```bash
npm install react-native-worklets@0.9.x
npx expo run:android   # triggers a new native build
```

This requires a full native rebuild (native code change) and was deferred to avoid another 15-minute Gradle cycle during this session.

---

## Problem 9 — Metro Starting in Expo Go Mode

### What happened
After the APK was installed, running `npx expo start --android` started the Metro dev server in standard Expo Go mode (using the `exp://` URL scheme). The installed APK is a **custom development client**, not Expo Go — it expects the `storyteller://` deep link scheme to connect to Metro.

In Expo Go mode, the terminal showed:
```
Metro waiting on exp://192.168.x.x:8081
```

The device received this URL but the custom dev client APK rejected it because it doesn't implement the `exp://` handler — it only handles `storyteller://` (the scheme defined in `app.json`).

### Fix applied
Switched to dev-client mode by passing the `--dev-client` flag:

```bash
npx expo start --dev-client --android
```

In dev-client mode, Metro starts and sends a `storyteller://` deep link to the device via ADB intent, which the installed custom APK correctly handles. The app opened, Metro connected, and the full JavaScript bundle loaded.

---

## Final State

### What is installed on the device
- **App:** Storyteller custom debug development client
- **APK:** `android/app/build/outputs/apk/debug/app-debug.apk` (85.8 MB, built April 4 2026 23:02)
- **Package name:** `com.hasan.storyteller` (from `app.json` slug)
- **Architecture:** New Architecture (Fabric + JSI), Hermes JS engine

### Final package.json (production dependencies)

```json
{
  "@expo-google-fonts/playfair-display": "^0.2.3",
  "@react-native-async-storage/async-storage": "2.2.0",
  "date-fns": "^4.1.0",
  "expo": "~54.0.33",
  "expo-constants": "~18.0.13",
  "expo-crypto": "~15.0.8",
  "expo-font": "~14.0.11",
  "expo-haptics": "~15.0.8",
  "expo-image": "~3.0.11",
  "expo-linear-gradient": "~15.0.8",
  "expo-linking": "~8.0.11",
  "expo-router": "~6.0.23",
  "expo-splash-screen": "~31.0.13",
  "expo-status-bar": "~3.0.9",
  "expo-system-ui": "~6.0.9",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-draggable-flatlist": "^4.0.1",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-paper": "^5.14.5",
  "react-native-reanimated": "~4.1.1",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0",
  "react-native-vector-icons": "^10.2.0",
  "react-native-worklets": "^0.8.1",
  "zustand": "^5.0.5"
}
```

### Resolved (actual installed) versions

| Package | Resolved version |
|---------|-----------------|
| `react-native-reanimated` | **4.1.7** |
| `react-native-worklets` | **0.8.1** |
| `expo-linking` | **8.0.11** |
| `expo-constants` | **18.0.13** |
| `expo-crypto` | **15.0.8** |
| `expo-haptics` | **15.0.8** |
| `expo-linear-gradient` | **15.0.8** |
| `expo-router` | **6.0.23** |
| `expo-system-ui` | **6.0.9** |
| `react-native-gesture-handler` | **2.28.0** |
| `react-native-safe-area-context` | **5.6.2** |
| `react-native-screens` | **4.16.0** |
| `@react-native-async-storage/async-storage` | **2.2.0** |

### Bundle stats (final successful run)
- **Modules bundled:** 2,076
- **Errors:** 0
- **Warnings:** 2 (Reanimated/Worklets version advisory — non-blocking)
- **Metro command:** `npx expo start --dev-client --android`

### Build stats (native APK)
- **Build tool:** Gradle 8.14.3
- **APK size:** 85.8 MB (debug, unminified, includes all native libraries + JS bundle)
- **Build duration:** ~14 minutes 39 seconds (first build; subsequent builds are ~30 seconds)
- **Java:** 17.0.12 LTS

---

## Files Created or Modified This Session

| File | Action | Description |
|------|--------|-------------|
| `android/local.properties` | **Created** | SDK path: `sdk.dir=C:/Users/Hasan/AppData/Local/Android/Sdk` |
| `package.json` | **Modified** | 9 package version changes + added `expo-linking` and `react-native-worklets` as explicit deps |
| `android/` (entire directory) | **Generated** | Full Android native project generated by `expo run:android` (Gradle files, Kotlin sources, manifests, res/) |
| `android/app/build/outputs/apk/debug/app-debug.apk` | **Generated** | 85.8 MB debug APK installed on device |

> The `android/` directory is generated by Expo and should be added to `.gitignore` if this project will be checked into version control, unless you want to commit the native layer. The `android/local.properties` file is already git-ignored by Expo's default `.gitignore`.

---

## How to Run the App in Future Sessions

The APK is now permanently installed on the device. For all future development sessions, only two steps are needed:

### Step 1 — Connect device (USB)
```bash
adb devices
# should show: RZCWA1QSW1V    device
```

### Step 2 — Start Metro
```bash
cd "c:\Users\Hasan\VSCodeProjects\android-app"
npx expo start --dev-client --android
```

Metro starts, pushes the `storyteller://` deep link to the device via ADB, the app opens automatically, and the JS bundle loads over your local network.

> You only need to run `npx expo run:android` again if you:
> - Install a new native module (something with code in `android/`)
> - Change `app.json` (scheme, permissions, plugins, `newArchEnabled`)
> - Update native-layer packages (e.g., `react-native-reanimated`, `react-native-gesture-handler`)
> - Get a new physical device

---

## Known Remaining Issues

| Issue | Severity | Impact | Fix |
|-------|----------|--------|-----|
| Debug APK is ~85 MB | Informational | Normal for debug builds | Release build with `expo build:android` will be ~15–20 MB |
| `expo-image` is installed but unused by app code | Low | Increases APK size slightly | Remove from `package.json` if Zone 2 (portrait generation) is not planned for next phase |

---
---

# Session 2 — Bug Fixes & Stability
**Session date:** April 5, 2025  
**Goal:** Fix splash screen hang, fix "Maximum update depth exceeded" crash on project open  
**Outcome:** All critical bugs resolved — app fully functional on device

---

## Problem 10 — Splash Screen Stuck (Native/JS Version Mismatch)

### What happened
After Session 1's APK was installed, the app was stuck on the splash screen and never reached the JS bundle. Diagnosed as a **native/JS version mismatch**: the APK was compiled with `react-native-worklets@0.8.1` native binaries, but `npx expo install --check` had downgraded the JS to `0.5.1` *after* the build.

### Resolution
1. Cleaned stale native build artifacts:
   ```bash
   rm -rf android/app/build android/app/.cxx android/.gradle
   ```
2. Verified `npx expo install --check` → "Dependencies are up to date" (worklets 0.5.1 matched)
3. Full rebuild: `npx expo run:android` → **BUILD SUCCESSFUL in 18m 45s** (322 tasks, 181 executed)
4. APK installed, Metro bundled 2055 modules in 2693ms — app launched successfully

---

## Problem 11 — "Maximum update depth exceeded" on Project Click

### What happened
Tapping any project on the home screen caused an immediate crash:
```
Error: Maximum update depth exceeded. This can happen when a component
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

### Root cause
Zustand store "getter" functions (`getMessagesByProject`, `getScenesByProject`, `getPrimaryCharacters`, `getBackgroundCharacters`) all create **new array references** via `.filter().sort()` on every store state change. When used as inline selectors — e.g. `useChatStore((s) => s.getMessagesByProject(projectId))` — each store update creates a new array → React sees a new reference → re-renders → triggers more updates → infinite loop.

### Files affected
| File | Unstable selector |
|------|-------------------|
| `src/components/BrainstormChat.tsx` | `useChatStore((s) => s.getMessagesByProject(projectId))` |
| `src/components/MasterDocument.tsx` | `useSceneStore((s) => s.getScenesByProject(projectId))` |
| `app/project/[id]/characters.tsx` | `useCharacterStore((s) => s.getPrimaryCharacters(projectId))` + `getBackgroundCharacters` |
| `src/components/SceneBlockCard.tsx` | `useCharacterStore.getState().characters.find(...)` in component body |

### Resolution
Replaced unstable store getter selectors with stable `useMemo` patterns:
- Subscribe to raw data arrays (e.g., `(s) => s.messages`) — stable reference when unchanged
- Derive filtered/sorted results in `useMemo` with proper dependency arrays
- `SceneBlockCard`: Moved from `getState()` call in component body to proper `useCharacterStore((s) => s.characters)` subscription + `useMemo`

Example fix:
```tsx
// BEFORE (unstable — new array every render)
const messages = useChatStore((s) => s.getMessagesByProject(projectId));

// AFTER (stable — only recomputes when messages or projectId change)
const allMessages = useChatStore((s) => s.messages);
const messages = useMemo(
  () => allMessages.filter((m) => m.projectId === projectId).sort((a, b) => a.timestamp - b.timestamp),
  [allMessages, projectId]
);
```

---

## Problem 12 — GestureHandlerRootView Missing

### What happened
After fixing the Zustand re-render loop, a second error appeared:
```
Error: GestureDetector must be used as a descendant of GestureHandlerRootView.
```
This was thrown by `react-native-draggable-flatlist` inside `MasterDocument.tsx`.

### Resolution
Wrapped the entire app tree in `GestureHandlerRootView` in `app/_layout.tsx`:
```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// ...
return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        {/* ... */}
      </PaperProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);
```

---

## Architecture Verification

Confirmed the app is running on **New Architecture (Fabric + JSI)**:

| Check | Result |
|-------|--------|
| `app.json` → `newArchEnabled` | `true` |
| `BuildConfig.java` → `IS_NEW_ARCHITECTURE_ENABLED` | `true` |
| `MainApplication.kt` → `DefaultNewArchitectureEntryPoint` | Present |
| Metro launch log | `Running "main" with {"fabric":true}` |

---

## Session 2 Summary

| Change | Files Modified |
|--------|---------------|
| Zustand selector stabilization (useMemo) | `BrainstormChat.tsx`, `MasterDocument.tsx`, `characters.tsx`, `SceneBlockCard.tsx` |
| GestureHandlerRootView wrapper | `app/_layout.tsx` |
| Full native rebuild (worklets fix) | `android/` (clean build) |

**Result:** App launches, navigates to projects, displays Brainstorm chat and Script editor without errors. Verified via screenshot — "The Clockwork Kingdom" project opens with chat bubbles rendered correctly.

---
---

# Session 3 — UX Fixes (7 Issues)
**Session date:** April 5, 2026  
**Goal:** Fix 7 UX issues discovered during first real-use session on device  
**Outcome:** All 7 issues resolved — JS-only changes, no native rebuild required

---

## Fix 1 — Script Tab Content Cut Off at Bottom

### What happened
In the Script tab (`MasterDocument.tsx`), the last scene card was partially or fully hidden behind the bottom navigation bar. The `DraggableFlatList`'s `contentContainerStyle` had `paddingBottom: 16`, which was too shallow to clear the navigation chrome.

### Fix applied — `src/components/MasterDocument.tsx`
```diff
- contentContainerStyle={{ paddingBottom: 16 }}
+ contentContainerStyle={styles.listContent}
```
```diff
+ listContent: {
+   paddingBottom: 100,
+ },
```
Changed `paddingBottom` from `16` to `100` so the list scrolls clear of the bottom nav bar.

---

## Fix 2 — Drag-and-Drop Jank on Scene Cards

### What happened
Dragging a scene card felt unreliable — small accidental vertical touches triggered the drag accidentally, and fast drags would "snap" erratically. The list also didn't auto-scroll when dragging toward the top/bottom edges.

### Fix applied — `src/components/MasterDocument.tsx`
Added three props to `DraggableFlatList`:
```diff
  <DraggableFlatList
    ...
+   activationDistance={15}
+   dragItemOverflow
+   autoscrollThreshold={80}
  />
```
- `activationDistance={15}`: Requires a 15px drag before activating the reorder gesture, preventing accidental triggers from taps.
- `dragItemOverflow`: Allows the dragged card's shadow/elevation to render outside its list item bounds.
- `autoscrollThreshold={80}`: Begins auto-scrolling the list when the drag handle is within 80px of the top or bottom edge.

---

## Fix 3 — Cannot Paste Text in Expanded Scene Cards

### What happened
In an expanded `SceneBlockCard`, the narration area was rendered as a `<Text>` component. The text was `selectable` but not editable — Android's paste action was unavailable, and typing was impossible.

### Fix applied — `src/components/SceneBlockCard.tsx`
Replaced the non-editable `<Text>` in the expanded state with a proper `<TextInput multiline>`:
```tsx
// Before (read-only)
<Text variant="bodySmall" ...>{scene.narration}</Text>

// After (editable when expanded)
<TextInput
  style={[styles.narrationInput, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
  value={scene.narration}
  onChangeText={(text) => updateScene(scene.id, { narration: text })}
  multiline
  placeholder="Write your scene narration..."
  placeholderTextColor={colors.onSurfaceVariant}
  textAlignVertical="top"
/>
```
Changes persist immediately to the Zustand store (and AsyncStorage).

---

## Fix 4 — No Way to Copy Chat Messages or Copy to Script

### What happened
Chat bubbles in `BrainstormChat.tsx` / `ChatBubble.tsx` showed AI-generated text but offered no copy mechanism. There was no way to transfer content to the clipboard or push text directly into the script editor.

### New dependency added
```bash
npx expo install expo-clipboard
# Native rebuild: BUILD SUCCESSFUL in 1m 17s
```

### Fix applied — `src/components/ChatBubble.tsx`
Added a `<Pressable onLongPress>` wrapper around each bubble that opens a Paper `<Menu>` with two actions:
```
Copy text       → Clipboard.setStringAsync(message.content)
Copy to Script  → calls onCopyToScript(text) prop (passed from BrainstormChat)
```
Both actions trigger `Haptics.notificationAsync(Success)` feedback.

Added `onCopyToScript` prop to `ChatBubble` → passed down from `BrainstormChat.tsx`, which calls `sceneStore.addScene` / appends the text to a target scene.

---

## Fix 5 — Genre Chips Were Stretched Vertically

### What happened
In `GenrePicker.tsx`, genre chips were stretching to fill the full height of the horizontal `ScrollView`, causing them to appear as tall rectangles rather than compact pill-shaped chips.

### Fix applied — `src/components/GenrePicker.tsx`
```diff
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
+   alignItems: 'center',
  },
  chip: {
    borderRadius: 20,
+   height: 38,
+   justifyContent: 'center',
  },
```
Added `alignItems: 'center'` to the container (prevents cross-axis stretch), and explicit `height: 38` with `justifyContent: 'center'` on the chip style.

---

## Fix 6 — Genre Chip Hit Box Too Small / Misaligned

### What happened
Tapping a genre chip sometimes didn't register, particularly near the edges of the chip. This was caused by the stretched layout from Fix 5 making the actual touchable area misaligned with the visible chip.

### Fix applied
Resolved as a side-effect of Fix 5 — once chips have a fixed height and the container uses `alignItems: 'center'`, the touch target aligns exactly with the visible chip bounds.

---

## Fix 7 — Character Initials Flickering in Scene Cards

### What happened
`SceneBlockCard.tsx` imported and rendered `AvatarInitials` components for each character associated with a scene. The `useCharacterStore` subscription inside the card combined with `DraggableFlatList`'s re-render cycle caused the initials to flicker during scrolling.

### Fix applied — `src/components/SceneBlockCard.tsx`
Removed the `AvatarInitials` rendering and the `useCharacterStore` import from `SceneBlockCard` entirely. The character association data still exists in the store — it was only the render-time subscription that was removed to eliminate the flicker.

---

## Session 3 Summary

| Fix | File | Change type |
|-----|------|-------------|
| Script bottom cut-off | `MasterDocument.tsx` | `paddingBottom: 16 → 100` |
| Drag-and-drop jank | `MasterDocument.tsx` | Added `activationDistance`, `dragItemOverflow`, `autoscrollThreshold` |
| No paste in narration | `SceneBlockCard.tsx` | `<Text>` → `<TextInput multiline>` when expanded |
| Copy / copy-to-script | `ChatBubble.tsx`, `BrainstormChat.tsx` | Long-press `Menu` with Clipboard + onCopyToScript |
| Stretched genre chips | `GenrePicker.tsx` | `alignItems: 'center'`, `height: 38`, `justifyContent: 'center'` |
| Genre chip hit area | `GenrePicker.tsx` | Fixed as side-effect of chip layout fix |
| Character initials flicker | `SceneBlockCard.tsx` | Removed `useCharacterStore` + `AvatarInitials` from card |

**Native change:** `expo-clipboard` added — required one additional native rebuild (1m 17s). All other fixes were JS-only (hot reload).

---
---

# Session 4 — UX Fixes (6 Issues)
**Session date:** April 5, 2026  
**Goal:** Fix 6 new UX issues: keyboard overlap, gesture conflict, floating FAB, scene deletion, drag flicker, custom genres  
**Outcome:** All 6 issues resolved — JS-only changes, no native rebuild required

---

## Fix 8 — Keyboard Blocking Chat Input on Android

### What happened
On Android, when the on-screen keyboard appeared in the Brainstorm Chat screen, it would overlay the message input bar and the bottom of the chat messages list. The user could not see what they were typing or the most recent messages.

### Root cause
`BrainstormChat.tsx` used `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>`. On Android, `behavior={undefined}` is a no-op — the `KeyboardAvoidingView` does nothing, leaving the keyboard to cover the input.

### Fix applied — `src/components/BrainstormChat.tsx`
```diff
  <KeyboardAvoidingView
-   behavior={Platform.OS === 'ios' ? 'padding' : undefined}
+   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
+   keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    style={{ flex: 1 }}
  >
```
Also added to the `FlatList`:
```diff
+ keyboardShouldPersistTaps="handled"
+ keyboardDismissMode="interactive"
```
- `behavior="height"` on Android causes the `KeyboardAvoidingView` to shrink its height when the keyboard appears, pushing the input bar and message list up.
- `keyboardShouldPersistTaps="handled"` ensures tapping the list to dismiss the keyboard doesn't accidentally trigger a list item.
- `keyboardDismissMode="interactive"` allows drag-dismissing the keyboard by swiping down on the list.

---

## Fix 9 — Long-Press Menu Conflicting with Native Text Selection

### What happened
`ChatBubble.tsx` wrapped each bubble in a `<Pressable onLongPress>` that opened a Paper `<Menu>`. Android's native text selection is also triggered by long-press. The `Pressable` intercepted all long-press events, making it impossible to select text in a chat bubble for sharing or copying via the OS selection toolbar.

### Root cause
`<Pressable onLongPress>` consumes the gesture at the React Native level before the native text selection engine can claim it. The `selectable` prop on `<Text>` was present but unreachable.

### Fix applied — `src/components/ChatBubble.tsx`
Removed the entire `Pressable onLongPress` + `Menu` pattern. Replaced with a **tap-to-reveal action icon row**:

```tsx
// Single tap on bubble toggles the action row
<Pressable onPress={() => setShowActions((v) => !v)}>
  <View style={styles.bubble}>
    <Text selectable>{message.content}</Text>   {/* native long-press selection works */}
    <Text>{formattedTime}</Text>
  </View>
</Pressable>

{showActions && (
  <View style={styles.actionRow}>
    <IconButton icon={copied ? 'check' : 'content-copy'} onPress={handleCopy} />
    {onCopyToScript && (
      <IconButton icon="script-text-outline" onPress={handleCopyToScript} />
    )}
  </View>
)}
```

- Single tap → toggles compact icon row below the bubble (copy + copy-to-script)
- Long-press → native Android text selection (selects text, shows OS toolbar with Copy/Share/etc.)
- Copy icon shows a check mark for 1.5 seconds after successful copy as feedback
- Removed `Menu`, `Divider` imports; added `IconButton`

---

## Fix 10 — "Add Scene" Button Disappears When Scrolling

### What happened
In the Script tab, the "Add Scene" button was positioned inside a `<View>` below the `DraggableFlatList`. As more scenes were added, the list grew to fill the screen and the button was pushed below the visible area, making it inaccessible without scrolling past the last card.

### Fix applied — `src/components/MasterDocument.tsx`
Replaced the static `<Button>` in `addBtnWrap` with a Paper `<FAB>` (Floating Action Button) anchored to the bottom-right corner:

```diff
- import { Text, Button, Badge, Snackbar, useTheme } from 'react-native-paper';
+ import { Text, Badge, Snackbar, FAB, useTheme } from 'react-native-paper';

- <View style={styles.addBtnWrap}>
-   <Button mode="outlined" icon="plus" onPress={handleAddScene}>
-     Add Scene
-   </Button>
- </View>

+ <FAB
+   icon="plus"
+   label="Add Scene"
+   onPress={handleAddScene}
+   style={[styles.fab, { backgroundColor: colors.primaryContainer }]}
+   color={colors.onPrimaryContainer}
+ />
```
```diff
+ fab: {
+   position: 'absolute',
+   right: 16,
+   bottom: 16,
+ },
- addBtnWrap: {
-   paddingHorizontal: 16,
-   paddingVertical: 12,
-   alignItems: 'center',
- },
```
The FAB floats over the list at all times regardless of scroll position. `paddingBottom: 100` on the list content already ensures the last card isn't obscured by the FAB.

---

## Fix 11 — No Way to Delete a Scene

### What happened
There was no UI affordance to delete a scene card from the Script tab. `sceneStore.deleteScene(id)` already existed but was never called from the UI.

### Fix applied — `src/components/SceneBlockCard.tsx`
Added a delete icon that becomes visible when a card is expanded, and a confirmation dialog before the delete executes:

```tsx
import { Card, Text, Chip, useTheme, IconButton, Portal, Dialog, Button } from 'react-native-paper';
// ...
const [confirmDelete, setConfirmDelete] = useState(false);
const deleteScene = useSceneStore((s) => s.deleteScene);

// In the title row, only when expanded:
{expanded && (
  <IconButton
    icon="delete-outline"
    size={18}
    iconColor={colors.error}
    onPress={() => setConfirmDelete(true)}
    style={styles.expandBtn}
  />
)}

// Confirmation dialog:
<Portal>
  <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
    <Dialog.Title>Delete Scene</Dialog.Title>
    <Dialog.Content>
      <Text>Delete "{scene.title}"? This cannot be undone.</Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={() => setConfirmDelete(false)}>Cancel</Button>
      <Button textColor={colors.error} onPress={() => { deleteScene(scene.id); setConfirmDelete(false); }}>
        Delete
      </Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
```
The red delete icon only appears when a card is expanded (prevents accidental taps during scrolling). The `Portal` renders the dialog above all other UI layers.

---

## Fix 12 — UI Flicker After Drag-and-Drop

### What happened
After a drag-and-drop reorder, all scene cards would visibly flicker/re-render, even cards whose position and content didn't change. On devices with a slower GPU, this was noticeable as a white flash.

### Root cause
`SceneBlockCard` was not wrapped in `React.memo`. When `reorderScenes` updated the Zustand store, the entire `scenes` array reference changed, causing `DraggableFlatList` to re-render every card even when individual card data was identical.

### Fix applied — `src/components/SceneBlockCard.tsx`
Renamed the component to `SceneBlockCardInner` and wrapped the export in `React.memo`:

```diff
- export function SceneBlockCard({ scene, index, drag, isActive }: SceneBlockCardProps) {
+ function SceneBlockCardInner({ scene, index, drag, isActive }: SceneBlockCardProps) {
  // ...
}
+ export const SceneBlockCard = React.memo(SceneBlockCardInner);
```
`React.memo` performs a shallow prop comparison. Since `scene` is an object reference that only changes when that specific scene's data changes (Zustand replaces only the modified entry), unchanged cards skip re-rendering entirely.

---

## Fix 13 — Genre Tags Are Fixed / Cannot Add Custom Genres

### What happened
The genre picker in `new-project.tsx` was limited to 8 hardcoded genres (`fantasy`, `sci-fi`, `noir`, etc.). Users had no way to create custom genre tags for niche categories like "steampunk", "mythpunk", "cosmic horror", etc.

### Changes across 4 files:

#### `src/types/project.ts`
```diff
- export type Genre =
-   | 'fantasy'
-   | 'sci-fi'
-   | 'noir'
-   | 'romance'
-   | 'horror'
-   | 'drama'
-   | 'adventure'
-   | 'comedy';
+ export type Genre = string;
+
+ export const DEFAULT_GENRES: Genre[] = [
+   'fantasy', 'sci-fi', 'noir', 'romance',
+   'horror', 'drama', 'adventure', 'comedy',
+ ];
```
Changed from a string union to `string` to allow any custom value. `DEFAULT_GENRES` constant preserves the original 8 for use in the picker UI.

#### `src/stores/projectStore.ts`
Added `customGenres` array to the persisted store state:
```diff
  interface ProjectState {
    projects: Project[];
+   customGenres: string[];
    hydrated: boolean;
    // ...
+   addCustomGenre: (genre: string) => void;
  }
```
```diff
  projects: [],
+ customGenres: [],
  hydrated: false,
```
```tsx
addCustomGenre: (genre) => {
  const trimmed = genre.trim().toLowerCase();
  if (!trimmed) return;
  set((state) => ({
    customGenres: state.customGenres.includes(trimmed)
      ? state.customGenres
      : [...state.customGenres, trimmed],
  }));
},
```
Custom genres are deduplicated and stored in the same AsyncStorage-backed store as projects, so they persist across app restarts.

#### `src/components/GenrePicker.tsx`
Rewrote to merge default + custom genres and add an inline "Custom" chip that opens a text input:

```tsx
const allGenres = [...DEFAULT_GENRES, ...customGenres];   // default 8 + user-created

// After all genre chips:
{adding ? (
  <View style={[styles.inputWrap, { borderColor: colors.primary }]}>
    <TextInput
      value={newGenre}
      onChangeText={setNewGenre}
      onSubmitEditing={handleSubmitCustom}
      onBlur={() => { setAdding(false); setNewGenre(''); }}
      placeholder="genre name"
      autoFocus
      maxLength={24}
      returnKeyType="done"
    />
  </View>
) : (
  <Chip icon="plus" onPress={() => setAdding(true)} mode="outlined" style={{ borderStyle: 'dashed' }}>
    Custom
  </Chip>
)}
```
Tapping "Custom" replaces the chip with an inline `TextInput`. Pressing Enter/Done saves the genre (adds to store, selects it), and the input field collapses back to the "Custom" chip.

#### `app/new-project.tsx`
Updated state type from the old union to `string`:
```diff
- const [genre, setGenre] = useState<Genre | null>(null);
+ const [genre, setGenre] = useState<string | null>(null);
```

---

## Session 4 Summary

| Fix | File(s) | Change type |
|-----|---------|-------------|
| Keyboard blocking chat | `BrainstormChat.tsx` | `behavior="height"` + KAV offset + FlatList keyboard props |
| Gesture conflict (text selection) | `ChatBubble.tsx` | Replaced long-press menu with tap-reveal icon row |
| Add Scene FAB | `MasterDocument.tsx` | Static button → `FAB` absolute positioned |
| Scene deletion | `SceneBlockCard.tsx` | Delete icon + Portal confirmation dialog |
| Drag flicker | `SceneBlockCard.tsx` | `React.memo` wrapper |
| Custom genre tags | `project.ts`, `projectStore.ts`, `GenrePicker.tsx`, `new-project.tsx` | `Genre = string`, persisted custom genre store, inline input chip |

**Native change:** None — all JS-only. Hot reload / Metro fast refresh sufficient.

---
---

# Session 8 — Multi-Select Delete on Script Tab + GitHub Push
**Session date:** April 5, 2026
**Goal:** Add multi-select scene deletion to Script tab; push codebase to GitHub
**Outcome:** Multi-select delete implemented; repository created at github.com/hasann222/storyteller

---

## Fix 19 — Multi-Select Scene Deletion

### Feature overview
Users can now long-press any scene card to enter selection mode, then tap additional cards to select them, and bulk-delete with a single confirmation.

### UX flow
1. **Enter selection mode** — long-press any scene card → haptic (Heavy) → that card is auto-selected
2. **Toggle selections** — tap any card to select/deselect → haptic (selection) per tap
3. **Selection toolbar** replaces the normal header:
   - Badge showing "N selected"
   - **All** button — selects every scene in the project
   - **Delete** button (error-tinted) — opens confirmation dialog
   - **×** icon — exits selection mode without changes
4. **Confirmation dialog** — "Delete N Scenes? This cannot be undone." → Cancel / Delete
5. **After delete** — snackbar "N scenes deleted", returns to normal mode
6. **FAB hidden** during selection mode to keep UI clean
7. **Drag disabled** during selection mode (drag handles become checkbox icons)

### Changes

#### `src/stores/sceneStore.ts`
Added `deleteScenes(ids: string[])` bulk delete action:
```ts
deleteScenes: (ids) => {
  const idSet = new Set(ids);
  set((state) => ({ scenes: state.scenes.filter((s) => !idSet.has(s.id)) }));
},
```

#### `src/components/SceneBlockCard.tsx`
New props: `isSelecting`, `isSelected`, `onSelect`, `onEnterSelect`
- Long-press on card body → `onEnterSelect(id)` (only when not already selecting)
- Tap on card body when `isSelecting` → `onSelect(id)` toggle
- Drag handle icon → `circle-outline` / `check-circle` when in selection mode
- Card `backgroundColor` → `colors.primaryContainer` when selected

#### `src/components/MasterDocument.tsx`
- `selectedIds: Set<string>` state, `isSelecting: boolean` (derived)
- `handleEnterSelect`, `handleToggleSelect`, `handleSelectAll`, `handleCancelSelect`, `handleDeleteSelected` callbacks
- Selection toolbar (replaces header when `isSelecting`)
- `Portal` + `Dialog` for bulk delete confirmation
- FAB hidden during selection mode
- `drag` prop set to `undefined` during selection mode

**Native change:** None — JS-only, hot reload sufficient.

---

## GitHub Repository
- **URL:** https://github.com/hasann222/storyteller
- **Initial commit:** Full project snapshot including all Sessions 1–8
- **Branch:** `main`

---

# Session 11 — Native Editing, Keyboard Fixes, Bubble Action Shelf
**Session date:** April 5, 2026
**Goal:** Restore native text selection on chat bubbles with subtle action icons; fix keyboard spacing on Brainstorm tab; fix cursor/editing in Script tab TextInput; make Script tab keyboard-aware.
**Outcome:** All fixes applied; no type errors; committed and pushed to GitHub

---

## Fix 27 — Restore Native Text Selection on Chat Bubbles; Action Icons Below Bubble

### Problem
The gesture-triggered context menu (Fix 23) wrapped the bubble in a `Pressable`, which unconditionally steals Android long-press from `<Text selectable>`. Native text selection was broken.

### Fix
**`src/components/ChatBubble.tsx`**
- Removed the `Pressable` wrapper and the `Menu` popup entirely.
- Restored `selectable` on the message `<Text>` — native Android long-press text selection works again.
- Added a subtle action shelf: two tiny icons (`content-copy`, `script-text-outline`) sitting just below the bubble's left edge, outside the bubble itself, in an `actions` row with `paddingTop: 2` and `paddingLeft: 8`.
- Icons use `Icon` from react-native-paper at `size={13}`, wrapped in individual `Pressable` with `hitSlop={6}` for accessible tap area without inflating visual size.
- Changed row `alignItems` from `flex-end` → `flex-start` so the avatar stays pinned at the top of the row, not dragged down by the actions shelf below the bubble.

---

## Fix 28 — Remove Input Placeholder; Fix Keyboard Gap Below Brainstorm Textbox

### Problem
1. The "Brainstorm an idea..." placeholder text was unwanted.
2. When the keyboard appeared, there was constant empty space between the ChatInput and the keyboard. Root cause: `Keyboard.endCoordinates.height` on edge-to-edge Android includes the bottom navigation bar inset, but that nav bar area is already accounted for by the view layout, causing over-padding.

### Fix
**`src/components/ChatInput.tsx`**
- Removed the `placeholder` prop from the `TextInput`.

**`src/components/BrainstormChat.tsx`**
- Changed `paddingBottom: keyboardPad` → `paddingBottom: keyboardPad - bottomInset` when keyboard is up. This subtracts the navigation bar portion that was being double-counted, eliminating the gap.

---

## Fix 29 — Fix Cursor Positioning and Text Editing in Script Scene Cards

### Problem
Clicking a scene's text editor placed the cursor at the end, but cursor could not be moved — tapping the text to place cursor or dragging the selection handle did nothing. Root cause: the `TextInput` was inside a `Pressable` whose `onPress` called `setExpanded(!expanded)`, so every tap on the TextInput area was intercepted by the Pressable and collapsed the card instead.

### Fix
**`src/components/SceneBlockCard.tsx`**
- Restructured the card interior: the `Pressable` now wraps only the title row and the collapsed narration preview.
- The expanded `TextInput`, visual metadata section, and their container (`expandedContent`) are siblings of the `Pressable`, inside a new `contentColumn` wrapper.
- The `TextInput` is no longer inside any `Pressable` — it gets full native touch handling: tap-to-position cursor, drag selection handles, long-press for native text selection.

---

## Fix 30 — Make Script Tab Keyboard-Aware (Push Content Above Keyboard)

### Problem
When editing the last scene card in the Script tab, the keyboard appeared and covered the TextInput. Unlike the Brainstorm tab, MasterDocument had no keyboard tracking — content couldn't scroll above the keyboard.

### Fix
**`src/components/MasterDocument.tsx`**
- Added keyboard height tracking via `Keyboard.addListener('keyboardDidShow'/'keyboardDidHide')`, same pattern as BrainstormChat.
- `keyboardPad = Math.max(0, endCoordinates.height - bottomInset)` (subtracts nav bar inset to avoid over-padding).
- `DraggableFlatList.contentContainerStyle.paddingBottom` now includes `keyboardPad` dynamically: `{ paddingBottom: 100 + keyboardPad }` — when keyboard is up, extra scrollable space appears so the last cards can be scrolled above the keyboard.
- Added `keyboardShouldPersistTaps="handled"` so tapping buttons inside scene cards doesn't dismiss the keyboard.

---

---

# Session 10 — Premium UX Polish: Gesture Menu, Input Styling, Scene Card Borders, Slide Navigation
**Session date:** April 5, 2026
**Goal:** Move bubble actions to a gesture-triggered popup; polish the chat input; fix washed-out scene cards; replace tab animation with an iOS-like horizontal slide keeping both panels alive.
**Outcome:** All four fixes applied; no errors; committed and pushed to GitHub

---

## Fix 23 — Gesture-Triggered Chat Bubble Context Menu (No Persistent Buttons)

### Problem
The previous design placed a `⋮` ``dots-horizontal`` button beside each bubble. It cluttered the UI and had an inherent sizing tension with small bubbles. The goal is zero always-visible chrome — purely gesture-driven, matching Telegram/WhatsApp/iMessage patterns.

### Fix
**`src/components/ChatBubble.tsx`**
- Removed the `⋮ IconButton` anchor entirely; no visible button on any bubble.
- Wrapped the bubble in a `Pressable` (`delayLongPress={500}`) — holding the bubble for 500 ms fires a medium haptic and opens the Paper `Menu`.
- Menu is anchored by screen coordinates obtained from `bubbleRef.current.measureInWindow(...)` on long-press, so it pops up adjacent to the pressed bubble.
- `collapsable={false}` on the inner `View` ensures Fabric doesn't collapse the ref target.
- Removed `selectable` from `<Text>` (a `Pressable` ancestor unconditionally steals Android long-press from `Text.selectable` — this is a React Native OS limitation; Copy in the menu covers the text-copy use-case, matching every major chat app).

---

## Fix 24 — Brainstorm Input Box Styling

### Problem
The text input (`Brainstorm an idea...`) had sharp Material default corners and a faint thin border, giving it an unpolished look compared to the warm amber theme.

### Fix
**`src/components/ChatInput.tsx`**
- Added `outlineStyle={{ borderRadius: 20, borderWidth: 1.5 }}` — pill-shaped, slightly thicker border gives a deliberate, finished look.
- Changed `outlineColor` from `colors.outline` to `colors.outlineVariant` (lighter warm beige at rest) so the idle state is softer; active state still highlights in `colors.primary` amber.
- Increased container padding: `paddingHorizontal: 12` (was 8), `paddingVertical: 8` (was 6).
- Separator changed from 1px solid to `StyleSheet.hairlineWidth` — subtler visual break.

---

## Fix 25 — Script Tab: Crisp Scene Block Borders, Remove Shadow Halo

### Problem
`Card mode="elevated"` applies Paper M3 elevation tinting and a soft shadow blur, making card edges look fuzzy and washed-out against the warm background. The left accent border's contrast suffered. The `overflow: 'hidden'` was compounding visual artifacts. Selection opacity of `0.45` was too harsh.

### Fix
**`src/components/SceneBlockCard.tsx`**
- Changed `Card mode="elevated"` → `mode="outlined"` — eliminates the elevation blur entirely; all 4 card borders are now crisp 1px lines.
- `borderColor` drives non-left border: `colors.outlineVariant` normally, `colors.primary` when selected (all 4 borders glow amber on selection, reinforcing the highlight).
- `borderLeftWidth: 4` left accent still overrides the left-border with `colors.primary` / `colors.outlineVariant` per selection state.
- Removed `overflow: 'hidden'` from the card style (not needed without elevation; was clipping subtle visual elements).
- Reduced unselected-while-selecting opacity from `0.45` → `0.65` — still clearly dimmed but not uncomfortably washed out.

---

## Fix 26 — Smooth iOS-like Horizontal Slide Between Tabs; Both Panels Always Mounted

### Problem
The fade-based tab switcher caused a full unmount/remount of each panel on every tab change — scroll positions, FlatList state, and keyboard state were all lost. The fade also looked abrupt. The goal is a slide matching the project-open stack transition.

### Fix
**`app/project/[id]/index.tsx`**
- Both `<BrainstormChat>` and `<MasterDocument>` are now **always mounted** side-by-side in a horizontal `Animated.View` (`flexDirection: 'row'`), each `width` pixels wide (from `useWindowDimensions`).
- An `overflow: 'hidden'` wrapper clips the off-screen panel out of view.
- `Animated.spring({ damping: 20, stiffness: 200, overshootClamping: true })` slides the row by ±`width` instantly when a tab is tapped — the spring delivers a snappy, natural deceleration with no bounce (`overshootClamping: true`).
- `setActiveTab` fires immediately (no async wait) so SegmentedButtons indicator updates in sync with the slide.
- The old `Animated.timing` fade (`fadeAnim`) and its 80 ms / 180 ms sequence are removed.
- Keyboard listeners in `BrainstormChat` continue to run while the Script tab is shown; this is intentional and harmless (matches React Navigation's tab keep-alive behavior).

---

---

# Session 9 — UX Polish: Selection Colours, Bubble Menu, Smooth Tab Transition
**Session date:** April 5, 2026
**Goal:** Fix inverted card selection colours; replace always-visible bubble action buttons with an out-of-bubble popup menu; make tab switching smooth and vibration-free
**Outcome:** All three fixes applied; committed and pushed to GitHub

---

## Fix 20 — Correct Selection State Visual Hierarchy on Script Tab Cards

### Problem
When entering selection mode (long-press a scene card), selected cards appeared to take on their "original" warm colour while unselected cards looked greyed out — the opposite of the intended behaviour. Root cause: `primaryContainer` (`#FDECD2`) is nearly identical to the surface colour at `elevation.level1` (`#FBF7F0`), so the selected background was imperceptible. Only the icon (`circle-outline` grey vs `check-circle` amber) created contrast, which reversed user expectation.

### Fix
**`src/components/SceneBlockCard.tsx`**
- Unselected cards while in selection mode → `opacity: 0.45` + `borderLeftColor: colors.outlineVariant` (muted border) — clearly dimmed/inactive
- Selected cards → `backgroundColor: rgba(196, 123, 43, 0.12)` (amber tint) + `elevation: 4` + `borderLeftColor: colors.primary` — clearly highlighted
- Normal (non-selection) mode → appearance unchanged

---

## Fix 21 — Replace Always-Visible Bubble Action Buttons with Out-of-Bubble Popup Menu

### Problem
The always-visible **Copy** and **Copy to Script** `IconButton`s in the chat bubble footer forced a minimum bubble width. A single-word message like "Hi" would render in an unnaturally wide bubble solely to accommodate the buttons. Additionally, having `Pressable` elements inside the bubble conflicts with Android native text selection.

### Fix
**`src/components/ChatBubble.tsx`**
- Removed `IconButton` elements from the bubble footer entirely. Footer is now timestamp-only.
- Added a small `⋮` (`dots-horizontal`) `IconButton` as an anchor for a React Native Paper `Menu`, positioned **outside** the bubble in the flex row:
  - User bubbles: `[⋮][bubble]` — menu button to the left
  - Assistant bubbles: `[avatar][bubble][⋮]` — menu button to the right
- Tapping `⋮` opens a `Menu` with **Copy text** and **Copy to Script** items (with leading icons).
- `<Text selectable>` inside the bubble has no `Pressable` ancestor → native Android text selection works via long-press.
- Bubble width is now determined purely by content.

---

## Fix 22 — Smooth iOS-like Crossfade on Tab Switch; Removed Haptic Vibration

### Problem
Switching between Brainstorm and Script tabs caused two issues:
1. `Haptics.impactAsync(Light)` fired on every switch → physical vibration, felt intrusive.
2. Content switched instantly with no visual transition → jarring "blink" effect.

### Fix
**`app/project/[id]/index.tsx`**
- Removed `Haptics.impactAsync` call (and the `expo-haptics` import) from `handleTabChange`.
- Added `fadeAnim = useRef(new Animated.Value(1)).current` animated value.
- `handleTabChange` now performs a smooth crossfade sequence:
  1. Fade out body content over **80 ms**
  2. Switch `activeTab` state
  3. Fade in new content over **180 ms**
- Wrapped panel body in `<Animated.View style={[styles.body, { opacity: fadeAnim }]}>` with `useNativeDriver: true` for GPU-accelerated animation.
- Total transition: ~260 ms — smooth and imperceptible on low-end hardware.

---

---

# Session 7 — Splash Screen Hang (Morning Reconnect Fix) + APK to Downloads
**Session date:** April 5, 2026
**Goal:** Fix recurring splash screen hang when opening the app after PC sleep/restart; push APK to device Downloads
**Outcome:** Root cause confirmed via logcat; fixed with USB tunnel; APK pushed to Downloads

---

## Problem 13 — Splash Screen Hang on Morning Open

### What happened
App was fully working last night. On next morning launch (tap icon), it hangs on splash screen indefinitely. Error from logcat:
```
E unknown:ReactHost: Unable to load script.
  at ReactInstance.loadJSBundleFromAssets(Native Method)
W BridgelessReact: ReactHost{0}.raiseSoftException() — Destroy: ReactInstance task faulted.
```

### Root cause
The Expo dev client stores the **last used Metro server URL** (e.g., `http://192.168.29.199:8085`) in device local storage. On the next session:
1. PC's WiFi IP changed (was `192.168.29.199`, now `192.168.29.65`)
2. App tried to reconnect to the stale stored URL → connection failed
3. `loadJSBundleFromAssets` fallback also failed (dev builds have no bundled app JS)
4. React Native destroyed the instance → `SplashScreen.hideAsync()` never called → infinite hang

> **Why `adjustResize` / previous session fixes don't help here:** This is a Metro URL staleness issue, not a layout issue.

### Fix applied
```bash
# 1. Create USB tunnel so device's localhost:8085 → PC's localhost:8085 (Metro)
adb -s RZCWA1QSW1V reverse tcp:8085 tcp:8085

# 2. Launch with localhost URL (works regardless of WiFi IP)
adb -s RZCWA1QSW1V shell am start -n com.anonymous.storyteller/.MainActivity \
  -a android.intent.action.VIEW \
  -d "storyteller://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8085"
```

After `adb reverse`, logcat confirmed:
```
W BridgelessReact: ReactHost{0}.loadJSBundleFromMetro()   ← now loading from Metro
I ReactNativeJS:   Running "main" with {"rootTag":1,"initialProps":{},"fabric":true}  ← bundle loaded ✅
V WindowManager:   Schedule remove starting ... SplashScreen  ← splash dismissed ✅
```

Metro also served incremental bundle (Session 6 changes): `Android Bundled 3329ms (1 module)`

### Permanent daily startup procedure

**Every new dev session, run these two commands BEFORE opening the app:**
```bash
cd "c:\Users\Hasan\VSCodeProjects\android-app"

# Step 1: Start Metro (if not already running)
npx expo start --dev-client --port 8085

# Step 2 (in a separate terminal): USB tunnel + deep link
adb -s RZCWA1QSW1V reverse tcp:8085 tcp:8085
adb -s RZCWA1QSW1V shell am start -n com.anonymous.storyteller/.MainActivity \
  -a android.intent.action.VIEW \
  -d "storyteller://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8085"
```

The `adb reverse` persists for the duration of the USB connection. The app will always connect to `localhost:8085` (tunneled to PC's Metro) regardless of what WiFi IP the PC has.

---

## APK Pushed to Device Downloads

The debug APK (85 MB) was copied to the device's Downloads folder for manual reinstallation:

```bash
MSYS_NO_PATHCONV=1 adb -s RZCWA1QSW1V push \
  "c:/Users/Hasan/VSCodeProjects/android-app/android/app/build/outputs/apk/debug/app-debug.apk" \
  /sdcard/Download/storyteller-debug.apk
```

**Location on device:** `Downloads/storyteller-debug.apk` (85 MB)

To manually reinstall: open Files app → Downloads → tap `storyteller-debug.apk` → Install.

> **Note:** The APK is the dev client (needs Metro). After reinstalling, always use the `adb reverse` + deep link startup procedure above to connect it to Metro.
> `MSYS_NO_PATHCONV=1` is required in Git Bash to prevent it from mangling `/sdcard/` paths.

---

## Session 7 Summary

| Action | Details |
|--------|---------|
| Root cause | Stale Metro URL stored on device; old WiFi IP no longer valid |
| Immediate fix | `adb reverse tcp:8085 tcp:8085` + localhost deep link |
| Permanent mitigation | Always run `adb reverse` at start of each dev session |
| APK | Pushed to `/sdcard/Download/storyteller-debug.apk` (85 MB) |

---
---

# Session 6 — Keyboard Fix (3rd Attempt) + Custom Genre Deletion
**Session date:** April 5, 2026
**Goal:** Definitively fix keyboard blocking chat input; add custom genre deletion UI
**Outcome:** Root cause identified and fixed; genre deletion added with close button

---

## Root Cause Discovery — edgeToEdgeEnabled: true

All previous keyboard fixes failed because `"edgeToEdgeEnabled": true` is set in `app.json`. On Android 15+ (target device: API 36), when edge-to-edge mode is active:

- `windowSoftInputMode="adjustResize"` is **deprecated and ignored by the OS** — the system no longer resizes the window when the keyboard appears
- `softwareKeyboardLayoutMode: "resize"` (from `app.json`) maps to `adjustResize` — which does nothing
- `KeyboardAvoidingView` relies on the underlying `adjustResize` to measure its own layout — also useless

The only mechanism that works on Android 15+ edge-to-edge is reading raw keyboard inset events and manually offsetting the layout.

---

## Fix 17 — Keyboard Blocking Chat (Definitive Fix)

### `src/components/BrainstormChat.tsx`

1. Added `useSafeAreaInsets` hook to get `bottomInset` (navigation bar height)
2. Added `keyboardPad` state (`number`) initialized to 0
3. Replaced the old keyboard scroll listener with a proper `keyboardDidShow/keyboardDidHide` effect that tracks actual keyboard height:
   ```tsx
   const show = Keyboard.addListener('keyboardDidShow', (e) => {
     setKeyboardPad(e.endCoordinates.height);
     setTimeout(scrollToBottom, 100);
   });
   const hide = Keyboard.addListener('keyboardDidHide', () => {
     setKeyboardPad(0);
   });
   ```
4. Applied dynamic `paddingBottom` to the Android container:
   ```tsx
   paddingBottom: keyboardPad > 0 ? keyboardPad : bottomInset
   ```
   - **Keyboard visible:** `paddingBottom = keyboardPad` — pushes entire chat (including input) above keyboard
   - **Keyboard hidden:** `paddingBottom = bottomInset` — clears the navigation bar so ChatInput is not behind it

**Why this works:**
- `e.endCoordinates.height` is the raw IME height from keyboard events, which fires correctly regardless of `adjustResize`
- We don't use `KeyboardAvoidingView` or `adjustResize` at all —  direct layout offset
- `bottomInset` (from `useSafeAreaInsets`) also fixes a secondary bug: the ChatInput was previously sitting partially behind the navigation bar even without the keyboard

---

## Fix 18 — Custom Genre Deletion

### `src/stores/projectStore.ts`

Added `deleteCustomGenre` action:
```tsx
deleteCustomGenre: (genre) => {
  set((state) => ({
    customGenres: state.customGenres.filter((g) => g !== genre),
  }));
},
```

### `src/components/GenrePicker.tsx`

1. Updated `onSelect` prop type to `(genre: Genre | null) => void` — allows deselecting when the currently-selected genre is deleted

2. Split chip rendering into two blocks:
   - **Default genres** (8 built-in): standard chips, no close button
   - **Custom genres**: each chip has an `onClose` handler showing a `close-circle` ×  button (native React Native Paper Chip feature)

3. Added `handleDeleteCustom`:
   ```tsx
   const handleDeleteCustom = (genre: string) => {
     deleteCustomGenre(genre);
     if (selected === genre) onSelect(null);  // auto-deselect if active
   };
   ```

**UX:** Custom genre chips show a small × icon on the right. Tapping it removes the genre from the store (persisted to AsyncStorage) and clears the selection if it was active. Default genres cannot be deleted.

---

## Session 6 Summary

| Fix | File(s) | Change type |
|-----|---------|-------------|
| Keyboard blocking (definitive) | `BrainstormChat.tsx` | Manual keyboard height tracking + `paddingBottom` offset |
| Navigation bar overlap | `BrainstormChat.tsx` | `paddingBottom: bottomInset` when keyboard hidden |
| Custom genre deletion | `projectStore.ts`, `GenrePicker.tsx` | `deleteCustomGenre` action + Chip `onClose` button |

**Native change:** None — all JS-only. Hot reload sufficient.

**Session date:** April 5, 2026  
**Goal:** Fix keyboard still blocking chat, text selection not working, and genre picker horizontal scroll not scaling  
**Outcome:** All 3 issues resolved — requires native rebuild (`app.json` change)

---

## Fix 14 — Keyboard Still Blocking Chat (Revised)

### What happened
The Session 4 fix (changing `KeyboardAvoidingView` `behavior` from `undefined` to `"height"`) did not resolve the issue on Android. The keyboard still overlaid the chat input and bottom messages.

### Root cause
On Android, the system provides its own keyboard avoidance mechanism via `windowSoftInputMode`. The default for Expo is `adjustResize`, which shrinks the available window height when the keyboard appears. However, wrapping the chat in `KeyboardAvoidingView` with `behavior="height"` **conflicts** with the system's `adjustResize` — both try to adjust the layout simultaneously, causing neither to work correctly.

Additionally, `softwareKeyboardLayoutMode` was not explicitly set in `app.json`, relying on the implicit default. On Samsung One UI with edge-to-edge mode enabled, this default can behave unpredictably.

### Fix applied

#### `app.json`
Explicitly set `softwareKeyboardLayoutMode: "resize"` in the Android config:
```diff
  "android": {
    ...
    "package": "com.anonymous.storyteller",
+   "softwareKeyboardLayoutMode": "resize"
  },
```
This guarantees `adjustResize` is set in the Android manifest regardless of edge-to-edge mode or OEM skin quirks.

> **Note:** This is a native config change — requires `npx expo run:android` to rebuild the APK.

#### `src/components/BrainstormChat.tsx`
Removed `KeyboardAvoidingView` entirely on Android. On Android with `adjustResize`, the system natively shrinks the window, so React Native's `KeyboardAvoidingView` is unnecessary and counterproductive:

```tsx
// On Android: plain View — system's adjustResize handles keyboard
if (Platform.OS === 'android') {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {chatContent}
    </View>
  );
}

// On iOS: KAV still needed (iOS doesn't have adjustResize)
return (
  <KeyboardAvoidingView
    style={[styles.container, { backgroundColor: colors.background }]}
    behavior="padding"
    keyboardVerticalOffset={100}
  >
    {chatContent}
  </KeyboardAvoidingView>
);
```

Also added a `Keyboard.addListener('keyboardDidShow')` effect that scrolls the FlatList to the bottom when the keyboard appears, so the latest messages remain visible:

```tsx
useEffect(() => {
  const sub = Keyboard.addListener('keyboardDidShow', () => {
    setTimeout(scrollToBottom, 100);
  });
  return () => sub.remove();
}, [scrollToBottom]);
```

---

## Fix 15 — Native Text Selection Not Working (Revised)

### What happened
The Session 4 fix replaced the `<Pressable onLongPress>` with a `<Pressable onPress>` (single-tap to toggle action row). However, native Android text selection **still** did not work. Additionally, the action row appearing below the bubble pushed the avatar icon downward because the avatar used `alignSelf: 'flex-end'` (bottom-aligned to the `bubbleWrap` container that grew taller when the action row appeared).

### Root cause (text selection)
Even `<Pressable onPress>` intercepts touch events on Android. The `Pressable` wrapper captured the initial touch before the underlying `<Text selectable>` could register it for selection. Any `Touchable*` or `Pressable` ancestor of a `<Text selectable>` will steal the gesture on Android.

### Root cause (avatar shift)
The avatar had `alignSelf: 'flex-end'` which bottom-aligned it to whatever container it was in. When the `bubbleWrap` container grew taller (due to the action row appearing below the bubble), the avatar shifted down to stay aligned with the bottom of the now-taller container.

### Fix applied — `src/components/ChatBubble.tsx`
Complete redesign:

1. **Removed ALL `Pressable`/touchable wrappers** from around the bubble. The bubble `<View>` is now a plain non-interactive container, so `<Text selectable>` can receive native touch events without interference.

2. **Moved action icons into the bubble itself**, on the same row as the timestamp (footer row). Copy and copy-to-script icons are always visible as small 14px icons next to the time. This eliminates the need for any tap/long-press toggle mechanism:

```tsx
<View style={styles.bubble}>
  <Text selectable>{message.content}</Text>
  <View style={styles.footer}>
    <Text>{formattedTime}</Text>
    <IconButton icon="content-copy" size={14} onPress={handleCopy} />
    {onCopyToScript && (
      <IconButton icon="script-text-outline" size={14} onPress={handleCopyToScript} />
    )}
  </View>
</View>
```

3. **Fixed avatar alignment**: Changed the row to `alignItems: 'flex-end'` (on the row itself), removed `alignSelf: 'flex-end'` from the avatar. The avatar stays bottom-aligned relative to the bubble regardless of bubble height.

Result:
- Long-press on text → native Android text selection with OS toolbar (Copy, Share, Select All)
- Copy icon → copies entire message to clipboard
- Script icon → creates a new scene from the message
- Avatar stays fixed at bubble bottom

---

## Fix 16 — Genre Picker Doesn't Scale With Many Tags

### What happened
The genre picker used a horizontal `ScrollView` with chips in a single row. With 8 default genres plus any custom genres, the user had to scroll horizontally to find genres at the end. With 20+ custom genres, the horizontal scroll distance became impractical — the user couldn't see all options at a glance.

### Fix applied — `src/components/GenrePicker.tsx`
Replaced the horizontal `ScrollView` with a **flex-wrap chip grid**. Chips now flow into multiple rows naturally, displaying all genres simultaneously without scrolling:

```diff
- <ScrollView
-   horizontal
-   showsHorizontalScrollIndicator={false}
-   contentContainerStyle={styles.container}
-   keyboardShouldPersistTaps="handled"
- >
+ <View style={styles.container}>

  const styles = StyleSheet.create({
    container: {
+     flexDirection: 'row',
+     flexWrap: 'wrap',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
-     alignItems: 'center',
    },
```

This is the standard pattern used by modern apps (Instagram topics, App Store categories, Spotify genre grids):
- Chips wrap into as many rows as needed
- All genres visible without horizontal scrolling
- The "+ Custom" chip sits at the end of the last row, inline with regular genres
- The inline text input for creating custom genres appears in-place when "+ Custom" is tapped

---

## Session 5 Summary

| Fix | File(s) | Change type |
|-----|---------|-------------|
| Keyboard blocking (revised) | `BrainstormChat.tsx`, `app.json` | Removed KAV on Android, explicit `adjustResize`, keyboard scroll listener |
| Text selection (revised) | `ChatBubble.tsx` | Removed all Pressable wrappers, inline footer icons, fixed avatar alignment |
| Genre picker scale | `GenrePicker.tsx` | Horizontal ScrollView → flex-wrap chip grid |

**Native change:** `app.json` → `softwareKeyboardLayoutMode: "resize"` added. Requires `npx expo run:android` for a native rebuild.
