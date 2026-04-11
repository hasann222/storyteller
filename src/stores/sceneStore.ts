import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SceneBlock } from '../types/scene';
import { generateId } from '../utils/id';

interface SceneState {
  scenes: SceneBlock[];
  addScene: (scene: Omit<SceneBlock, 'id'>) => string;
  updateScene: (id: string, updates: Partial<Omit<SceneBlock, 'id' | 'projectId'>>) => void;
  deleteScene: (id: string) => void;
  deleteScenes: (ids: string[]) => void;
  deleteScenesByProject: (projectId: string) => void;
  getScenesByProject: (projectId: string) => SceneBlock[];
  reorderScenes: (projectId: string, fromIndex: number, toIndex: number) => void;
}

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      scenes: [],
      addScene: (data) => {
        const id = generateId();
        const scene: SceneBlock = { ...data, id };
        set((state) => ({ scenes: [...state.scenes, scene] }));
        return id;
      },
      updateScene: (id, updates) => {
        set((state) => ({
          scenes: state.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },
      deleteScene: (id) => {
        set((state) => ({ scenes: state.scenes.filter((s) => s.id !== id) }));
      },
      deleteScenes: (ids) => {
        const idSet = new Set(ids);
        set((state) => ({ scenes: state.scenes.filter((s) => !idSet.has(s.id)) }));
      },
      deleteScenesByProject: (projectId) => {
        set((state) => ({
          scenes: state.scenes.filter((s) => s.projectId !== projectId),
        }));
      },
      getScenesByProject: (projectId) =>
        get()
          .scenes.filter((s) => s.projectId === projectId)
          .sort((a, b) => a.order - b.order),
      reorderScenes: (projectId, fromIndex, toIndex) => {
        const projectScenes = get()
          .scenes.filter((s) => s.projectId === projectId)
          .sort((a, b) => a.order - b.order);
        const [moved] = projectScenes.splice(fromIndex, 1);
        projectScenes.splice(toIndex, 0, moved);
        const reordered = projectScenes.map((s, i) => ({ ...s, order: i }));
        const otherScenes = get().scenes.filter((s) => s.projectId !== projectId);
        set({ scenes: [...otherScenes, ...reordered] });
      },
    }),
    {
      name: 'portal-scenes',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
