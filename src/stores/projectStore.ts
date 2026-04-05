import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Project, Genre } from '../types/project';
import { DEFAULT_SYSTEM_PROMPT } from '../types/project';
import { generateId } from '../utils/id';

interface ProjectState {
  projects: Project[];
  customGenres: string[];
  hydrated: boolean;
  addProject: (title: string, premise: string, genre: Genre) => string;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  addCustomGenre: (genre: string) => void;
  deleteCustomGenre: (genre: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      customGenres: [],
      hydrated: false,
      addProject: (title, premise, genre) => {
        const id = generateId();
        const now = Date.now();
        const project: Project = { id, title, premise, genre, systemPrompt: DEFAULT_SYSTEM_PROMPT, createdAt: now, updatedAt: now };
        set((state) => ({ projects: [project, ...state.projects] }));
        return id;
      },
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        }));
      },
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },
      getProject: (id) => get().projects.find((p) => p.id === id),
      addCustomGenre: (genre) => {
        const trimmed = genre.trim().toLowerCase();
        if (!trimmed) return;
        set((state) => ({
          customGenres: state.customGenres.includes(trimmed)
            ? state.customGenres
            : [...state.customGenres, trimmed],
        }));
      },
      deleteCustomGenre: (genre) => {
        set((state) => ({
          customGenres: state.customGenres.filter((g) => g !== genre),
        }));
      },
    }),
    {
      name: 'storyteller-projects',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useProjectStore.setState({ hydrated: true });
      },
    }
  )
);
