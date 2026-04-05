import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '../types/scene';
import { generateId } from '../utils/id';

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
  addMessage: (projectId: string, role: 'user' | 'assistant', content: string) => string;
  sendUserMessage: (projectId: string, content: string) => void;
  getMessagesByProject: (projectId: string) => ChatMessage[];
  deleteMessagesByProject: (projectId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
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
      },
      getMessagesByProject: (projectId) =>
        get()
          .messages.filter((m) => m.projectId === projectId)
          .sort((a, b) => a.timestamp - b.timestamp),
      deleteMessagesByProject: (projectId) => {
        set((state) => ({
          messages: state.messages.filter((m) => m.projectId !== projectId),
        }));
      },
    }),
    {
      name: 'storyteller-chat',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
