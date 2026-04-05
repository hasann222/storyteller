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

// ── Active stream controllers (not persisted) ──

const streamControllers = new Map<string, AbortController>();

// ── Types ──

interface ChatState {
  messages: ChatMessage[];
  responseIdMap: Record<string, string>;
  addMessage: (projectId: string, role: 'user' | 'assistant', content: string) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  sendUserMessage: (projectId: string, content: string) => void;
  cancelStream: (projectId: string) => void;
  getMessagesByProject: (projectId: string) => ChatMessage[];
  deleteMessagesByProject: (projectId: string) => void;
  clearResponseId: (projectId: string) => void;
}

// ── Helpers ──

function buildRequestBody(
  projectId: string,
  content: string,
  previousResponseId: string | undefined,
): Record<string, unknown> {
  const project = useProjectStore.getState().getProject(projectId);
  const model = useSettingsStore.getState().aiModel;

  const body: Record<string, unknown> = {
    model,
    stream: true,
    input: [{ role: 'user', content }],
  };
  if (project?.systemPrompt && !previousResponseId) {
    body.instructions = project.systemPrompt;
  }
  if (previousResponseId) {
    body.previous_response_id = previousResponseId;
  }
  return body;
}

/** Parse SSE lines from raw text and feed deltas into updateFn */
function parseSSELines(
  lines: string[],
  state: { accumulated: string; responseId: string; firstDelta: boolean },
  updateFn: (updates: Partial<ChatMessage>) => void,
) {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data: ')) continue;
    const data = trimmed.slice(6);
    if (data === '[DONE]') continue;

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(data);
    } catch {
      continue;
    }

    if (parsed.type === 'response.output_text.delta' && parsed.delta) {
      if (state.firstDelta) {
        state.firstDelta = false;
        updateFn({ isThinking: false, isStreaming: true });
      }
      state.accumulated += parsed.delta as string;
      updateFn({ content: state.accumulated });
    } else if (parsed.type === 'response.done') {
      const doneResp = parsed.response as Record<string, unknown> | undefined;
      state.responseId = (doneResp?.id as string) ?? '';
    }
  }
}

/** Streaming call — always used. Handles both ReadableStream and text fallback. */
async function callGrokApiStreaming(
  projectId: string,
  content: string,
  previousResponseId: string | undefined,
  updateFn: (updates: Partial<ChatMessage>) => void,
  signal: AbortSignal,
): Promise<{ responseId: string }> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('No API key');

  const body = buildRequestBody(projectId, content, previousResponseId);

  const resp = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => 'Unknown error');
    throw new Error(`API error ${resp.status}: ${errText}`);
  }

  const state = { accumulated: '', responseId: '', firstDelta: true };

  // Prefer ReadableStream when available (modern environments)
  if (resp.body && typeof resp.body.getReader === 'function') {
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        parseSSELines(lines, state, updateFn);
      }
      // Process remaining buffer
      if (buffer.trim()) {
        parseSSELines([buffer], state, updateFn);
      }
    } finally {
      reader.releaseLock();
    }
  } else {
    // Fallback for React Native (Hermes) — read full response as text, parse SSE
    const text = await resp.text();
    const lines = text.split('\n');
    parseSSELines(lines, state, updateFn);
  }

  updateFn({ isStreaming: false });
  return { responseId: state.responseId };
}

// ── Store ──

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

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m,
          ),
        }));
      },

      sendUserMessage: (projectId, content) => {
        // Add user message
        const userMsg: ChatMessage = {
          id: generateId(),
          projectId,
          role: 'user',
          content,
          timestamp: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, userMsg] }));

        const previousResponseId = get().responseIdMap[projectId];

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

          // Always stream
          const assistantMsgId = generateId();
          const placeholder: ChatMessage = {
            id: assistantMsgId,
            projectId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            isThinking: true,
          };
          set((state) => ({ messages: [...state.messages, placeholder] }));

          const controller = new AbortController();
          streamControllers.set(projectId, controller);

          const updateMsg = (updates: Partial<ChatMessage>) =>
            get().updateMessage(assistantMsgId, updates);

          callGrokApiStreaming(
            projectId,
            content,
            previousResponseId,
            updateMsg,
            controller.signal,
          )
            .then(({ responseId }) => {
              if (responseId) {
                set((state) => ({
                  responseIdMap: { ...state.responseIdMap, [projectId]: responseId },
                }));
              }
            })
            .catch((err) => {
              const current = get().messages.find((m) => m.id === assistantMsgId);
              const partial = current?.content ?? '';

              if (err instanceof Error && err.name === 'AbortError') {
                updateMsg({ isThinking: false, isStreaming: false });
                return;
              }

              const errText = err instanceof Error ? err.message : 'Failed to reach API';
              updateMsg({
                content: partial ? `${partial}\n\n⚠️ ${errText}` : `⚠️ Error: ${errText}`,
                isThinking: false,
                isStreaming: false,
              });
            })
            .finally(() => {
              streamControllers.delete(projectId);
            });
        });
      },

      cancelStream: (projectId) => {
        const controller = streamControllers.get(projectId);
        if (controller) {
          controller.abort();
          streamControllers.delete(projectId);
        }
      },

      getMessagesByProject: (projectId) =>
        get()
          .messages.filter((m) => m.projectId === projectId)
          .sort((a, b) => a.timestamp - b.timestamp),

      deleteMessagesByProject: (projectId) => {
        const controller = streamControllers.get(projectId);
        if (controller) {
          controller.abort();
          streamControllers.delete(projectId);
        }
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
      onRehydrateStorage: () => (state) => {
        if (state?.messages) {
          state.messages = state.messages.map((m) =>
            m.isThinking || m.isStreaming
              ? { ...m, isThinking: undefined, isStreaming: undefined }
              : m,
          );
        }
      },
    },
  ),
);
