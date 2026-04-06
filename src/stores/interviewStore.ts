import { create } from 'zustand';
import { getApiKey, useSettingsStore } from './settingsStore';
import { useProjectStore } from './projectStore';
import { generateId } from '../utils/id';

// ── Types ──

export interface InterviewMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isThinking?: boolean;
  isStreaming?: boolean;
}

interface InterviewState {
  messages: InterviewMessage[];
  responseId: string;
  addMessage: (role: 'user' | 'assistant', content: string) => string;
  updateMessage: (id: string, updates: Partial<InterviewMessage>) => void;
  sendMessage: (projectId: string, content: string) => void;
  cancelStream: () => void;
  clearInterview: () => void;
}

// ── Active stream controller ──

let streamController: AbortController | null = null;

// ── SSE helpers (mirrored from chatStore) ──

function parseSSELines(
  lines: string[],
  state: { accumulated: string; responseId: string; firstDelta: boolean },
  updateFn: (updates: Partial<InterviewMessage>) => void,
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

async function callInterviewStreaming(
  projectId: string,
  content: string,
  previousResponseId: string | undefined,
  updateFn: (updates: Partial<InterviewMessage>) => void,
  signal: AbortSignal,
): Promise<{ responseId: string }> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('No API key');

  const project = useProjectStore.getState().getProject(projectId);
  const genre = project?.genre ?? 'fantasy';
  const { interviewPrompt, aiModel } = useSettingsStore.getState();
  const instructions = interviewPrompt.replace(/\{\{genre\}\}/g, genre);

  const body: Record<string, unknown> = {
    model: aiModel,
    stream: true,
    input: [{ role: 'user', content }],
  };
  if (!previousResponseId) {
    body.instructions = instructions;
  }
  if (previousResponseId) {
    body.previous_response_id = previousResponseId;
  }

  const state = { accumulated: '', responseId: '', firstDelta: true };

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    signal.addEventListener('abort', () => {
      xhr.abort();
      reject(new DOMException('Aborted', 'AbortError'));
    });

    let processedLength = 0;
    let partialLine = '';

    xhr.onprogress = () => {
      const newChunk = xhr.responseText.substring(processedLength);
      processedLength = xhr.responseText.length;
      const rawLines = (partialLine + newChunk).split('\n');
      partialLine = rawLines.pop() ?? '';
      parseSSELines(rawLines, state, updateFn);
    };

    xhr.onload = () => {
      if (xhr.status >= 400) {
        reject(new Error(`API error ${xhr.status}: ${xhr.responseText.slice(0, 200)}`));
        return;
      }
      if (partialLine.trim()) {
        parseSSELines([partialLine], state, updateFn);
      }
      updateFn({ isStreaming: false });
      resolve({ responseId: state.responseId });
    };

    xhr.onerror = () => reject(new Error('Network error'));

    xhr.open('POST', 'https://api.x.ai/v1/responses');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhr.send(JSON.stringify(body));
  });
}

// ── Store (ephemeral — no persistence) ──

export const useInterviewStore = create<InterviewState>()((set, get) => ({
  messages: [],
  responseId: '',

  addMessage: (role, content) => {
    const id = generateId();
    const msg: InterviewMessage = { id, role, content, timestamp: Date.now() };
    set((state) => ({ messages: [...state.messages, msg] }));
    return id;
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  sendMessage: (projectId, content) => {
    const previousResponseId = get().responseId || undefined;

    // Add user message
    get().addMessage('user', content);

    getApiKey().then((key) => {
      if (!key) return;

      // Add assistant placeholder
      const assistantId = generateId();
      const placeholder: InterviewMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isThinking: true,
      };
      set((state) => ({ messages: [...state.messages, placeholder] }));

      const controller = new AbortController();
      streamController = controller;

      const updateMsg = (updates: Partial<InterviewMessage>) =>
        get().updateMessage(assistantId, updates);

      callInterviewStreaming(projectId, content, previousResponseId, updateMsg, controller.signal)
        .then(({ responseId }) => {
          if (responseId) set({ responseId });
        })
        .catch((err) => {
          const current = get().messages.find((m) => m.id === assistantId);
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
          streamController = null;
        });
    });
  },

  cancelStream: () => {
    if (streamController) {
      streamController.abort();
      streamController = null;
    }
  },

  clearInterview: () => {
    if (streamController) {
      streamController.abort();
      streamController = null;
    }
    set({ messages: [], responseId: '' });
  },
}));
