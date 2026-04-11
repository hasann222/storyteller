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

// ── Character Prompt Defaults ─────────────────────────────────

export const DEFAULT_INTERVIEW_PROMPT = `You are a character co-writer for a {{genre}} story. Your job is to help the user discover and develop an original character through conversation.

Rules:
- Ask 1-3 focused questions per message.
- Adapt your questions based on what the user has shared so far.
- Explore facets: appearance, personality, backstory, motivations, fears, relationships, speech patterns, quirks.
- Never generate the final character yourself — only ask questions and reflect back interesting details.
- Keep a warm, collaborative, curious tone.`;

export const DEFAULT_EXTRACT_INTERVIEW_PROMPT = `You are a data-extraction engine. Analyze the following conversation between a user and an interviewer and extract a single character.

Output ONLY valid JSON matching this schema — no markdown, no explanation:
{
  "character_data": {
    "name": "string",
    "age": "string",
    "sex": "string",
    "other": "string — consolidate all other character information into readable plaintext"
  },
  "narrative_description": "string — three paragraphs written as an in-world narrator introducing this character. Rich, evocative, literary.",
  "image_prompt": "string — a detailed concept-art brief for a 9:16 portrait of this character. Include physical appearance, clothing, setting, lighting, and art style."
}`;

export const DEFAULT_EXTRACT_STANDARD_PROMPT = `You are a data-extraction engine. The user has provided freeform notes describing a character for a {{genre}} story. Extract a single character from these notes.

Fill gaps intelligently — infer consistent details where the user was vague. Do not contradict anything explicit.

Output ONLY valid JSON matching this schema — no markdown, no explanation:
{
  "character_data": {
    "name": "string",
    "age": "string",
    "sex": "string",
    "other": "string — consolidate all other character information into readable plaintext"
  },
  "narrative_description": "string — three paragraphs written as an in-world narrator introducing this character. Rich, evocative, literary.",
  "image_prompt": "string — a detailed concept-art brief for a 9:16 portrait of this character. Include physical appearance, clothing, setting, lighting, and art style."
}`;

export const DEFAULT_REFINE_PROMPT = `You are a creative writing assistant for a {{genre}} story. The user has written rough notes describing a character. Your job is to expand and enrich those notes.

Rules:
- Preserve everything the user wrote — do not remove or contradict any detail.
- Add depth: fill in plausible appearance details, personality nuances, backstory beats, and relationship hints.
- Output readable prose in second person ("Your character is..."), under 400 words.
- Do not output JSON — just polished, readable text.`;

export const DEFAULT_RANDOM_CHARACTER_PROMPT = `Invent an original character for a {{genre}} story. Avoid clichés. Make bold, specific choices.

Output ONLY valid JSON matching this schema — no markdown, no explanation:
{
  "character_data": {
    "name": "string",
    "age": "string",
    "sex": "string",
    "other": "string — consolidate all other character information into readable plaintext"
  },
  "narrative_description": "string — three paragraphs written as an in-world narrator introducing this character. Rich, evocative, literary.",
  "image_prompt": "string — a detailed concept-art brief for a 9:16 portrait of this character. Include physical appearance, clothing, setting, lighting, and art style."
}`;

interface SettingsState {
  themeMode: ThemeMode;
  fontScale: FontScale;
  aiModel: AiModel;
  cachedTeamId: string | null;
  hydrated: boolean;

  // Character prompts
  interviewPrompt: string;
  extractInterviewPrompt: string;
  extractStandardPrompt: string;
  refinePrompt: string;
  randomCharacterPrompt: string;

  setThemeMode: (mode: ThemeMode) => void;
  setFontScale: (scale: FontScale) => void;
  setAiModel: (model: AiModel) => void;
  setCachedTeamId: (id: string | null) => void;

  setInterviewPrompt: (p: string) => void;
  setExtractInterviewPrompt: (p: string) => void;
  setExtractStandardPrompt: (p: string) => void;
  setRefinePrompt: (p: string) => void;
  setRandomCharacterPrompt: (p: string) => void;
  resetCharacterPrompts: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'light',
      fontScale: 'default',
      aiModel: 'grok-4-1-fast-reasoning',
      cachedTeamId: null,
      hydrated: false,

      interviewPrompt: DEFAULT_INTERVIEW_PROMPT,
      extractInterviewPrompt: DEFAULT_EXTRACT_INTERVIEW_PROMPT,
      extractStandardPrompt: DEFAULT_EXTRACT_STANDARD_PROMPT,
      refinePrompt: DEFAULT_REFINE_PROMPT,
      randomCharacterPrompt: DEFAULT_RANDOM_CHARACTER_PROMPT,

      setThemeMode: (mode) => set({ themeMode: mode }),
      setFontScale: (scale) => set({ fontScale: scale }),
      setAiModel: (model) => set({ aiModel: model }),
      setCachedTeamId: (id) => set({ cachedTeamId: id }),

      setInterviewPrompt: (p) => set({ interviewPrompt: p }),
      setExtractInterviewPrompt: (p) => set({ extractInterviewPrompt: p }),
      setExtractStandardPrompt: (p) => set({ extractStandardPrompt: p }),
      setRefinePrompt: (p) => set({ refinePrompt: p }),
      setRandomCharacterPrompt: (p) => set({ randomCharacterPrompt: p }),
      resetCharacterPrompts: () =>
        set({
          interviewPrompt: DEFAULT_INTERVIEW_PROMPT,
          extractInterviewPrompt: DEFAULT_EXTRACT_INTERVIEW_PROMPT,
          extractStandardPrompt: DEFAULT_EXTRACT_STANDARD_PROMPT,
          refinePrompt: DEFAULT_REFINE_PROMPT,
          randomCharacterPrompt: DEFAULT_RANDOM_CHARACTER_PROMPT,
        }),
    }),
    {
      name: 'portal-settings',
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
