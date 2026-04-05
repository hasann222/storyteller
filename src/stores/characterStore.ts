import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Character, PrimaryCharacter, BackgroundCharacter } from '../types/character';
import { generateId } from '../utils/id';

interface CharacterState {
  characters: Character[];
  addCharacter: (character: Omit<Character, 'id' | 'createdAt'>) => string;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  deleteCharactersByProject: (projectId: string) => void;
  getCharactersByProject: (projectId: string) => Character[];
  getPrimaryCharacters: (projectId: string) => PrimaryCharacter[];
  getBackgroundCharacters: (projectId: string) => BackgroundCharacter[];
  getCharacter: (id: string) => Character | undefined;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: [],
      addCharacter: (data) => {
        const id = generateId();
        const character = { ...data, id, createdAt: Date.now() } as Character;
        set((state) => ({ characters: [...state.characters, character] }));
        return id;
      },
      updateCharacter: (id, updates) => {
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id ? ({ ...c, ...updates } as Character) : c
          ),
        }));
      },
      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        }));
      },
      deleteCharactersByProject: (projectId) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.projectId !== projectId),
        }));
      },
      getCharactersByProject: (projectId) =>
        get().characters.filter((c) => c.projectId === projectId),
      getPrimaryCharacters: (projectId) =>
        get().characters.filter(
          (c) => c.projectId === projectId && c.type === 'primary'
        ) as PrimaryCharacter[],
      getBackgroundCharacters: (projectId) =>
        get().characters.filter(
          (c) => c.projectId === projectId && c.type === 'background'
        ) as BackgroundCharacter[],
      getCharacter: (id) => get().characters.find((c) => c.id === id),
    }),
    {
      name: 'storyteller-characters',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
