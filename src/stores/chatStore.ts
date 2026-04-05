import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '../types/scene';
import { generateId } from '../utils/id';
import { getApiKey, useSettingsStore } from './settingsStore';
import { useProjectStore } from './projectStore';

const MOCK_REPLIES = [
  "That's a fascinating direction! What if we added a twist where the character discovers something unexpected about their past?",
  "I love the tension you're building here. Consider adding a moment of quiet reflection before the big confrontation — it makes the payoff more powerful.",
  "Great character work! Their motivation feels authentic. Maybe we could layer in a secondary objective that creates internal conflict?",
  "The setting you're describing is vivid. What if the environment itself becomes a kind of antagonist — weather, terrain, or an ancient mechanism that fights back?",
  "This scene could really benefit from a sensory detail — what does the air smell like? What sounds are in the background? It pulls the reader deeper in.",
  "Interesting choice! What if we mirror this scene later from the antagonist's perspective? It would add wonderful symmetry to the narrative.",
  "The pacing here feels right. Quick suggestion: what if we end this scene on a cliffhanger to keep the audience hooked into the next one?",
  "I think this character needs a moment of vulnerability. Even the strongest characters feel doubt — it makes them relatable.",
];

interface ChatState {
  messages: ChatMessage[];
  responseIdMap: Record<string, string>;
  addMessage: (projectId: string, role: 'user' | 'assistant', content: string) => string;
  sendUserMessage: (projectId: string, content: string) => void;
  getMessagesByProject: (projectId: string) => ChatMessage[];
  deleteMessagesByProject: (projectId: string) => void;
  clearResponseId: (projectId: string) => void;
}

async function callGrokApi(
  projectId: string,
  content: string,
  previousResponseId: string | undefined,
): Promise<{ text: string; responseId: string }> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('No API key');

  const project = useProjectStore.getState().getProject(projectId);
  const model = useSettingsStore.getState().aiModel;

  const body: Record<string, unknown> = {
    model,
    input: [{ role: 'user', content }],
  };
  if (project?.systemPrompt) {
    body.instructions = project.systemPrompt;
  }
  if (previousResponseId) {
    body.previous_response_id = previousResponseId;
  }

  const resp = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text().catch(() => 'Unknown error');
    throw new Error(`Grok API error ${resp.status}: ${err}`);
  }

  const json = await resp.json();
  const outputText =
    json.output_text ??
    json.output?.find((o: { type: string }) => o.type === 'message')?.content
      ?.find((c: { type: string }) => c.type === 'output_text')?.text ??
    'No response from Grok.';

  return { text: outputText, responseId: json.id };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      responseIdMap: {},
      addMessage: (projectId, role, content) => {
        const id = generateId();
        const message: ChatMessage = { id, projectId, role, content, timestamp: Date.now() };
        set((state) => ({ messages: [...state.messages, message] }));
        return id;
      },
      sendUserMessage: (projectId, content) => {
        const userMsgId = generateId();
        const userMsg: ChatMessage = {
          id: userMsgId,
          projectId,
          role: 'user',
          content,
          timestamp: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, userMsg] }));

        const previousResponseId = get().responseIdMap[projectId];

        // Try real API, fall back to mock
        getApiKey().then((key) => {
          if (!key) {
            // Mock fallback
            setTimeout(() => {
              const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
              const assistantMsg: ChatMessage = {
                id: generateId(),
                projectId,
                role: 'assistant',
                content: reply,
                timestamp: Date.now(),
              };
              set((state) => ({ messages: [...state.messages, assistantMsg] }));
            }, 800);
            return;
          }

          callGrokApi(projectId, content, previousResponseId)
            .then(({ text, responseId }) => {
              const assistantMsg: ChatMessage = {
                id: generateId(),
                projectId,
                role: 'assistant',
                content: text,
                timestamp: Date.now(),
              };
              set((state) => ({
                messages: [...state.messages, assistantMsg],
                responseIdMap: { ...state.responseIdMap, [projectId]: responseId },
              }));
            })
            .catch((err) => {
              const errorMsg: ChatMessage = {
                id: generateId(),
                projectId,
                role: 'assistant',
                content: `⚠️ Error: ${err instanceof Error ? err.message : 'Failed to reach Grok API'}`,
                timestamp: Date.now(),
              };
              set((state) => ({ messages: [...state.messages, errorMsg] }));
            });
        });
      },
      getMessagesByProject: (projectId) =>
        get()
          .messages.filter((m) => m.projectId === projectId)
          .sort((a, b) => a.timestamp - b.timestamp),
      deleteMessagesByProject: (projectId) => {
        set((state) => ({
          messages: state.messages.filter((m) => m.projectId !== projectId),
          responseIdMap: (() => {
            const map = { ...state.responseIdMap };
            delete map[projectId];
            return map;
          })(),
        }));
      },
      clearResponseId: (projectId) => {
        set((state) => {
          const map = { ...state.responseIdMap };
          delete map[projectId];
          return { responseIdMap: map };
        });
      },
    }),
    {
      name: 'storyteller-chat',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
