import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontScale = 'small' | 'default' | 'large';
export type AiModel =
  | 'grok-4.20-reasoning'
  | 'grok-4'
  | 'grok-4-fast'
  | 'grok-4-1-fast-reasoning';

const API_KEY_STORAGE_KEY = 'xai-api-key';
const MGMT_KEY_STORAGE_KEY = 'xai-management-key';

interface SettingsState {
  themeMode: ThemeMode;
  fontScale: FontScale;
  aiModel: AiModel;
  cachedTeamId: string | null;
  hydrated: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setFontScale: (scale: FontScale) => void;
  setAiModel: (model: AiModel) => void;
  setCachedTeamId: (id: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'light',
      fontScale: 'default',
      aiModel: 'grok-4-1-fast-reasoning',
      cachedTeamId: null,
      hydrated: false,
      setThemeMode: (mode) => set({ themeMode: mode }),
      setFontScale: (scale) => set({ fontScale: scale }),
      setAiModel: (model) => set({ aiModel: model }),
      setCachedTeamId: (id) => set({ cachedTeamId: id }),
    }),
    {
      name: 'storyteller-settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useSettingsStore.setState({ hydrated: true });
      },
    }
  )
);

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

export async function getMgmtKey(): Promise<string | null> {
  return SecureStore.getItemAsync(MGMT_KEY_STORAGE_KEY);
}

export async function setMgmtKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(MGMT_KEY_STORAGE_KEY, key);
}

export async function deleteMgmtKey(): Promise<void> {
  await SecureStore.deleteItemAsync(MGMT_KEY_STORAGE_KEY);
}
