/**
 * resetAllStores
 *
 * Resets every Zustand store to its true initial state using `getInitialState()`
 * (Zustand v4.4.1+). Call this in a global `beforeEach` inside each store
 * test file, or in a global jest setup to isolate all test suites.
 *
 * Usage:
 *   import { resetAllStores } from '../helpers/store';
 *   beforeEach(resetAllStores);
 */
import { useProjectStore } from '../../src/stores/projectStore';
import { useCharacterStore } from '../../src/stores/characterStore';
import { useSceneStore } from '../../src/stores/sceneStore';
import { useChatStore } from '../../src/stores/chatStore';
import { useInterviewStore } from '../../src/stores/interviewStore';
import { useSettingsStore } from '../../src/stores/settingsStore';

export function resetAllStores(): void {
  // The `true` flag tells Zustand to replace state entirely (not merge).
  useProjectStore.setState(useProjectStore.getInitialState(), true);
  useCharacterStore.setState(useCharacterStore.getInitialState(), true);
  useSceneStore.setState(useSceneStore.getInitialState(), true);
  useChatStore.setState(useChatStore.getInitialState(), true);
  useInterviewStore.setState(useInterviewStore.getInitialState(), true);
  useSettingsStore.setState(useSettingsStore.getInitialState(), true);
}
