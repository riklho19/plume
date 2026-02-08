import { create } from 'zustand';
import type { Character } from '../types/models';
import * as api from '../lib/api/characters';
import { toastError } from '../components/ui/Toast';
import { UI } from '../lib/constants';

interface CharacterState {
  characters: Character[];
  sceneLinks: Record<string, string[]>; // sceneId -> characterId[]
  loading: boolean;

  loadCharacters: (projectId: string) => Promise<void>;
  loadSceneLinks: (sceneId: string) => Promise<void>;
  createCharacter: (projectId: string, data: Omit<Character, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCharacter: (id: string, data: Partial<Pick<Character, 'name' | 'role' | 'description' | 'notes' | 'color'>>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  linkToScene: (sceneId: string, characterId: string) => Promise<void>;
  unlinkFromScene: (sceneId: string, characterId: string) => Promise<void>;
}

function dbToCharacter(db: Record<string, unknown>): Character {
  return {
    id: db.id as string,
    projectId: db.project_id as string,
    name: db.name as string,
    role: db.role as string,
    description: db.description as string,
    notes: db.notes as string,
    color: db.color as string,
    createdAt: db.created_at as string,
    updatedAt: db.updated_at as string,
  };
}

export const useCharacterStore = create<CharacterState>()((set, get) => ({
  characters: [],
  sceneLinks: {},
  loading: false,

  loadCharacters: async (projectId) => {
    set({ loading: true });
    try {
      const data = await api.fetchCharacters(projectId);
      set({ characters: data.map((d) => dbToCharacter(d as unknown as Record<string, unknown>)) });
    } catch {
      toastError(UI.errorGeneric);
    } finally {
      set({ loading: false });
    }
  },

  loadSceneLinks: async (sceneId) => {
    try {
      const data = await api.fetchSceneCharacters(sceneId);
      set((s) => ({
        sceneLinks: { ...s.sceneLinks, [sceneId]: data.map((d) => d.character_id) },
      }));
    } catch {
      // Silent fail
    }
  },

  createCharacter: async (projectId, charData) => {
    try {
      const db = await api.createCharacter(projectId, charData);
      const char = dbToCharacter(db as unknown as Record<string, unknown>);
      set((s) => ({ characters: [...s.characters, char] }));
    } catch {
      toastError(UI.errorGeneric);
    }
  },

  updateCharacter: async (id, data) => {
    // Optimistic
    set((s) => ({
      characters: s.characters.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    }));
    try {
      await api.updateCharacter(id, data);
    } catch {
      toastError(UI.errorSave);
    }
  },

  deleteCharacter: async (id) => {
    const prev = get().characters;
    set((s) => ({ characters: s.characters.filter((c) => c.id !== id) }));
    try {
      await api.deleteCharacter(id);
    } catch {
      set({ characters: prev });
      toastError(UI.errorGeneric);
    }
  },

  linkToScene: async (sceneId, characterId) => {
    set((s) => ({
      sceneLinks: {
        ...s.sceneLinks,
        [sceneId]: [...(s.sceneLinks[sceneId] || []), characterId],
      },
    }));
    try {
      await api.linkCharacterToScene(sceneId, characterId);
    } catch {
      toastError(UI.errorGeneric);
    }
  },

  unlinkFromScene: async (sceneId, characterId) => {
    set((s) => ({
      sceneLinks: {
        ...s.sceneLinks,
        [sceneId]: (s.sceneLinks[sceneId] || []).filter((id) => id !== characterId),
      },
    }));
    try {
      await api.unlinkCharacterFromScene(sceneId, characterId);
    } catch {
      toastError(UI.errorGeneric);
    }
  },
}));
