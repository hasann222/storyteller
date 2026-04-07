import * as SecureStore from 'expo-secure-store';
import {
  useSettingsStore,
  getApiKey,
  setApiKey,
  deleteApiKey,
  DEFAULT_INTERVIEW_PROMPT,
  DEFAULT_EXTRACT_INTERVIEW_PROMPT,
  DEFAULT_EXTRACT_STANDARD_PROMPT,
  DEFAULT_REFINE_PROMPT,
  DEFAULT_RANDOM_CHARACTER_PROMPT,
} from '../../src/stores/settingsStore';
import { resetAllStores } from '../helpers/store';

beforeEach(resetAllStores);

afterEach(async () => {
  // Keep the in-memory secure store clean between tests
  await SecureStore.deleteItemAsync('xai-api-key');
  await SecureStore.deleteItemAsync('xai-management-key');
});

// ── Initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has themeMode light', () => {
    expect(useSettingsStore.getState().themeMode).toBe('light');
  });

  it('has fontScale default', () => {
    expect(useSettingsStore.getState().fontScale).toBe('default');
  });

  it('has aiModel grok-4-1-fast-reasoning', () => {
    expect(useSettingsStore.getState().aiModel).toBe('grok-4-1-fast-reasoning');
  });

  it('has null cachedTeamId', () => {
    expect(useSettingsStore.getState().cachedTeamId).toBeNull();
  });

  it('ships default character prompts', () => {
    const s = useSettingsStore.getState();
    expect(s.interviewPrompt).toBe(DEFAULT_INTERVIEW_PROMPT);
    expect(s.extractInterviewPrompt).toBe(DEFAULT_EXTRACT_INTERVIEW_PROMPT);
    expect(s.extractStandardPrompt).toBe(DEFAULT_EXTRACT_STANDARD_PROMPT);
    expect(s.refinePrompt).toBe(DEFAULT_REFINE_PROMPT);
    expect(s.randomCharacterPrompt).toBe(DEFAULT_RANDOM_CHARACTER_PROMPT);
  });
});

// ── UI preferences ────────────────────────────────────────────────────────────

describe('setThemeMode', () => {
  it('updates themeMode to dark', () => {
    useSettingsStore.getState().setThemeMode('dark');
    expect(useSettingsStore.getState().themeMode).toBe('dark');
  });

  it('updates themeMode to system', () => {
    useSettingsStore.getState().setThemeMode('system');
    expect(useSettingsStore.getState().themeMode).toBe('system');
  });
});

describe('setFontScale', () => {
  it('updates fontScale', () => {
    useSettingsStore.getState().setFontScale('large');
    expect(useSettingsStore.getState().fontScale).toBe('large');
  });
});

describe('setAiModel', () => {
  it('updates aiModel', () => {
    useSettingsStore.getState().setAiModel('grok-4');
    expect(useSettingsStore.getState().aiModel).toBe('grok-4');
  });
});

describe('setCachedTeamId', () => {
  it('stores a team id', () => {
    useSettingsStore.getState().setCachedTeamId('team-xyz');
    expect(useSettingsStore.getState().cachedTeamId).toBe('team-xyz');
  });

  it('accepts null to clear the team id', () => {
    useSettingsStore.getState().setCachedTeamId('team-xyz');
    useSettingsStore.getState().setCachedTeamId(null);
    expect(useSettingsStore.getState().cachedTeamId).toBeNull();
  });
});

// ── Character prompts ─────────────────────────────────────────────────────────

describe('setInterviewPrompt', () => {
  it('updates interviewPrompt', () => {
    useSettingsStore.getState().setInterviewPrompt('Custom interview prompt');
    expect(useSettingsStore.getState().interviewPrompt).toBe('Custom interview prompt');
  });
});

describe('setExtractInterviewPrompt', () => {
  it('updates extractInterviewPrompt', () => {
    useSettingsStore.getState().setExtractInterviewPrompt('Custom extract');
    expect(useSettingsStore.getState().extractInterviewPrompt).toBe('Custom extract');
  });
});

describe('resetCharacterPrompts', () => {
  it('restores every prompt to its default value', () => {
    useSettingsStore.getState().setInterviewPrompt('Changed!');
    useSettingsStore.getState().setExtractStandardPrompt('Also changed!');
    useSettingsStore.getState().setRefinePrompt('Modified');
    useSettingsStore.getState().setRandomCharacterPrompt('Different');
    useSettingsStore.getState().resetCharacterPrompts();

    const s = useSettingsStore.getState();
    expect(s.interviewPrompt).toBe(DEFAULT_INTERVIEW_PROMPT);
    expect(s.extractStandardPrompt).toBe(DEFAULT_EXTRACT_STANDARD_PROMPT);
    expect(s.refinePrompt).toBe(DEFAULT_REFINE_PROMPT);
    expect(s.randomCharacterPrompt).toBe(DEFAULT_RANDOM_CHARACTER_PROMPT);
  });
});

// ── API key helpers ───────────────────────────────────────────────────────────

describe('getApiKey / setApiKey / deleteApiKey', () => {
  it('getApiKey returns null when no key is stored', async () => {
    expect(await getApiKey()).toBeNull();
  });

  it('setApiKey stores the key and getApiKey retrieves it', async () => {
    await setApiKey('sk-test-key');
    expect(await getApiKey()).toBe('sk-test-key');
  });

  it('deleteApiKey removes the stored key', async () => {
    await setApiKey('sk-test-key');
    await deleteApiKey();
    expect(await getApiKey()).toBeNull();
  });
});
