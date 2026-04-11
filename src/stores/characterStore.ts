import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Character } from '../types/character';
import { generateId } from '../utils/id';
import { deleteCharacterImage } from '../utils/imageStorage';

interface CharacterState {
  characters: Character[];
  addCharacter: (character: Omit<Character, 'id' | 'createdAt'>) => string;
  updateCharacterImage: (id: string, imageUri: string) => void;
  deleteCharacter: (id: string) => void;
  deleteCharactersByProject: (projectId: string) => void;
  getCharactersByProject: (projectId: string) => Character[];
  getCharacter: (id: string) => Character | undefined;
  copyCharacterToProject: (charId: string, targetProjectId: string) => string | undefined;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: [],
      addCharacter: (data) => {
        const id = generateId();
        const character: Character = { ...data, id, createdAt: Date.now() };
        set((state) => ({ characters: [...state.characters, character] }));
        return id;
      },
      updateCharacterImage: (id, imageUri) => {
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id ? { ...c, imageUri } : c
          ),
        }));
      },
      deleteCharacter: (id) => {
        const char = get().characters.find((c) => c.id === id);
        if (char?.imageUri) {
          try { deleteCharacterImage(char.id); } catch {}
        }
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        }));
      },
      deleteCharactersByProject: (projectId) => {
        const toDelete = get().characters.filter((c) => c.projectId === projectId);
        toDelete.forEach((c) => {
          if (c.imageUri) try { deleteCharacterImage(c.id); } catch {}
        });
        set((state) => ({
          characters: state.characters.filter((c) => c.projectId !== projectId),
        }));
      },
      getCharactersByProject: (projectId) =>
        get().characters.filter((c) => c.projectId === projectId),
      getCharacter: (id) => get().characters.find((c) => c.id === id),
      copyCharacterToProject: (charId, targetProjectId) => {
        const source = get().getCharacter(charId);
        if (!source) return undefined;
        const clone: Character = JSON.parse(JSON.stringify(source));
        clone.id = generateId();
        clone.projectId = targetProjectId;
        clone.createdAt = Date.now();
        // Note: imageUri points to the original file — shared reference is fine
        set((state) => ({ characters: [...state.characters, clone] }));
        return clone.id;
      },
    }),
    {
      name: 'portal-characters',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
