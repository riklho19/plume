import { create } from 'zustand';
import type { Project, Chapter, Scene, Genre } from '../types/models';
import { generateId } from '../lib/id';
import { countWords } from '../lib/wordCount';
import { toastError, toastSuccess } from '../components/ui/Toast';
import { UI } from '../lib/constants';
import * as projectsApi from '../lib/api/projects';
import * as chaptersApi from '../lib/api/chapters';
import * as scenesApi from '../lib/api/scenes';
import { hydrateProjects } from '../lib/api/hydrate';

interface ProjectState {
  projects: Project[];
  sharedProjects: Project[];
  loading: boolean;
  loaded: boolean;
  _loadingPromise: Promise<void> | null;

  loadProjects: () => Promise<void>;
  createProject: (title: string, summary: string, genre: Genre) => Promise<string>;
  updateProject: (id: string, updates: Partial<Pick<Project, 'title' | 'summary' | 'genre'>>) => void;
  deleteProject: (id: string) => void;

  addChapter: (projectId: string, title?: string) => Promise<string>;
  updateChapter: (projectId: string, chapterId: string, updates: Partial<Pick<Chapter, 'title' | 'isCollapsed'>>) => void;
  deleteChapter: (projectId: string, chapterId: string) => void;
  reorderChapters: (projectId: string, chapterIds: string[]) => void;

  addScene: (projectId: string, chapterId: string, title?: string) => Promise<string>;
  updateSceneTitle: (projectId: string, chapterId: string, sceneId: string, title: string) => void;
  updateSceneContent: (projectId: string, chapterId: string, sceneId: string, content: string) => void;
  deleteScene: (projectId: string, chapterId: string, sceneId: string) => void;
  reorderScenes: (projectId: string, chapterId: string, sceneIds: string[]) => void;
  moveSceneToChapter: (projectId: string, fromChapterId: string, toChapterId: string, sceneId: string, newIndex: number) => void;
}

function syncError() {
  toastError(UI.errorSave);
}

/** Search both own and shared projects */
function findInAll(state: ProjectState, projectId: string) {
  return state.projects.find((p) => p.id === projectId)
    || state.sharedProjects.find((p) => p.id === projectId);
}

/** Map over both own and shared project arrays */
function mapAll(state: ProjectState, projectId: string, fn: (p: Project) => Project) {
  return {
    projects: state.projects.map((p) => (p.id === projectId ? fn(p) : p)),
    sharedProjects: state.sharedProjects.map((p) => (p.id === projectId ? fn(p) : p)),
  };
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  sharedProjects: [],
  loading: false,
  loaded: false,
  _loadingPromise: null,

  loadProjects: async () => {
    // Concurrency guard: if already loading, return the existing promise
    const existing = get()._loadingPromise;
    if (existing) return existing;

    const promise = (async () => {
      set({ loading: true });
      try {
        // Check for localStorage migration
        const localData = localStorage.getItem('plume-projects');
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (parsed?.state?.projects?.length > 0) {
              await migrateLocalProjects(parsed.state.projects);
              localStorage.removeItem('plume-projects');
              toastSuccess(UI.migrationDone);
            } else {
              localStorage.removeItem('plume-projects');
            }
          } catch {
            localStorage.removeItem('plume-projects');
          }
        }

        const [ownDb, sharedDb] = await Promise.all([
          projectsApi.fetchOwnProjects(),
          projectsApi.fetchSharedProjects(),
        ]);
        const [own, shared] = await Promise.all([
          hydrateProjects(ownDb),
          hydrateProjects(sharedDb),
        ]);
        set({ projects: own, sharedProjects: shared, loaded: true });
      } catch (e) {
        console.error('Failed to load projects', e);
        toastError(UI.errorNetwork);
        set({ loaded: true });
      } finally {
        set({ loading: false, _loadingPromise: null });
      }
    })();

    set({ _loadingPromise: promise });
    return promise;
  },

  createProject: async (title, summary, genre) => {
    // No optimistic update — wait for the server to confirm
    try {
      const db = await projectsApi.createProject(title, summary, genre);
      const now = new Date().toISOString();
      const project: Project = {
        id: db.id, ownerId: db.owner_id, title, summary, genre,
        isPublic: db.is_public,
        shareToken: db.share_token,
        chapters: [],
        createdAt: db.created_at || now,
        updatedAt: db.updated_at || now,
      };
      set((s) => ({ projects: [project, ...s.projects] }));
      return db.id;
    } catch {
      syncError();
      return '';
    }
  },

  updateProject: (id, updates) => {
    const now = new Date().toISOString();
    set((s) => mapAll(s, id, (p) => ({ ...p, ...updates, updatedAt: now })));
    projectsApi.updateProject(id, updates).catch(syncError);
  },

  deleteProject: (id) => {
    const prev = get().projects;
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    projectsApi.deleteProject(id).catch(() => {
      set({ projects: prev });
      syncError();
    });
  },

  addChapter: async (projectId, title) => {
    const project = findInAll(get(), projectId);
    const chapterTitle = title || `Chapitre ${(project?.chapters.length ?? 0) + 1}`;
    const order = project?.chapters.length ?? 0;

    try {
      const db = await chaptersApi.createChapter(projectId, chapterTitle, order);
      const now = new Date().toISOString();
      const chapter: Chapter = {
        id: db.id, title: chapterTitle, scenes: [], order,
        isCollapsed: false, createdAt: now, updatedAt: now,
      };
      set((s) => mapAll(s, projectId, (p) => ({
        ...p, chapters: [...p.chapters, chapter], updatedAt: now,
      })));
      return db.id;
    } catch {
      syncError();
      return '';
    }
  },

  updateChapter: (projectId, chapterId, updates) => {
    const now = new Date().toISOString();
    set((s) => mapAll(s, projectId, (p) => ({
      ...p, updatedAt: now,
      chapters: p.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, ...updates, updatedAt: now } : ch
      ),
    })));
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.isCollapsed !== undefined) dbUpdates.is_collapsed = updates.isCollapsed;
    chaptersApi.updateChapter(chapterId, dbUpdates as { title?: string; is_collapsed?: boolean }).catch(syncError);
  },

  deleteChapter: (projectId, chapterId) => {
    const now = new Date().toISOString();
    set((s) => mapAll(s, projectId, (p) => {
      const chapters = p.chapters
        .filter((ch) => ch.id !== chapterId)
        .map((ch, i) => ({ ...ch, order: i }));
      return { ...p, chapters, updatedAt: now };
    }));
    chaptersApi.deleteChapter(chapterId).catch(syncError);
  },

  reorderChapters: (projectId, chapterIds) => {
    const now = new Date().toISOString();
    set((s) => mapAll(s, projectId, (p) => {
      const reordered = chapterIds
        .map((id, index) => {
          const ch = p.chapters.find((c) => c.id === id);
          return ch ? { ...ch, order: index } : null;
        })
        .filter((ch): ch is Chapter => ch !== null);
      return { ...p, chapters: reordered, updatedAt: now };
    }));
    chaptersApi.reorderChapters(chapterIds).catch(syncError);
  },

  addScene: async (projectId, chapterId, title) => {
    const project = findInAll(get(), projectId);
    const chapter = project?.chapters.find((ch) => ch.id === chapterId);
    const sceneTitle = title || `Scène ${(chapter?.scenes.length ?? 0) + 1}`;
    const order = chapter?.scenes.length ?? 0;

    try {
      const db = await scenesApi.createScene(projectId, chapterId, sceneTitle, order);
      const now = new Date().toISOString();
      const scene: Scene = {
        id: db.id, title: sceneTitle, content: '', order,
        wordCount: 0, createdAt: now, updatedAt: now,
      };
      set((s) => mapAll(s, projectId, (p) => ({
        ...p, updatedAt: now,
        chapters: p.chapters.map((ch) => {
          if (ch.id !== chapterId) return ch;
          return { ...ch, scenes: [...ch.scenes, scene], updatedAt: now };
        }),
      })));
      return db.id;
    } catch {
      syncError();
      return '';
    }
  },

  updateSceneTitle: (projectId, chapterId, sceneId, title) => {
    const now = new Date().toISOString();
    set((s) => mapAll(s, projectId, (p) => ({
      ...p, updatedAt: now,
      chapters: p.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch, updatedAt: now,
          scenes: ch.scenes.map((sc) =>
            sc.id === sceneId ? { ...sc, title, updatedAt: now } : sc
          ),
        };
      }),
    })));
    scenesApi.updateScene(sceneId, { title }).catch(syncError);
  },

  updateSceneContent: (projectId, chapterId, sceneId, content) => {
    const wc = countWords(content);
    const now = new Date().toISOString();
    set((s) => mapAll(s, projectId, (p) => ({
      ...p, updatedAt: now,
      chapters: p.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch, updatedAt: now,
          scenes: ch.scenes.map((sc) =>
            sc.id === sceneId
              ? { ...sc, content, wordCount: wc, updatedAt: now }
              : sc
          ),
        };
      }),
    })));
    scenesApi.updateScene(sceneId, { content, word_count: wc }).catch(syncError);
  },

  deleteScene: (projectId, chapterId, sceneId) => {
    const now = new Date().toISOString();
    set((s) => mapAll(s, projectId, (p) => ({
      ...p, updatedAt: now,
      chapters: p.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const scenes = ch.scenes
          .filter((sc) => sc.id !== sceneId)
          .map((sc, i) => ({ ...sc, order: i }));
        return { ...ch, scenes, updatedAt: now };
      }),
    })));
    scenesApi.deleteScene(sceneId).catch(syncError);
  },

  reorderScenes: (projectId, chapterId, sceneIds) => {
    const now = new Date().toISOString();
    set((s) => mapAll(s, projectId, (p) => ({
      ...p, updatedAt: now,
      chapters: p.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const reordered = sceneIds
          .map((id, index) => {
            const sc = ch.scenes.find((s) => s.id === id);
            return sc ? { ...sc, order: index } : null;
          })
          .filter((sc): sc is Scene => sc !== null);
        return { ...ch, scenes: reordered, updatedAt: now };
      }),
    })));
    scenesApi.reorderScenes(sceneIds).catch(syncError);
  },

  moveSceneToChapter: (projectId, fromChapterId, toChapterId, sceneId, newIndex) => {
    const now = new Date().toISOString();
    const project = findInAll(get(), projectId);
    if (!project) return;

    const fromChapter = project.chapters.find((ch) => ch.id === fromChapterId);
    const scene = fromChapter?.scenes.find((sc) => sc.id === sceneId);
    if (!scene) return;

    set((s) => mapAll(s, projectId, (p) => ({
      ...p, updatedAt: now,
      chapters: p.chapters.map((ch) => {
        if (ch.id === fromChapterId) {
          const scenes = ch.scenes
            .filter((sc) => sc.id !== sceneId)
            .map((sc, i) => ({ ...sc, order: i }));
          return { ...ch, scenes, updatedAt: now };
        }
        if (ch.id === toChapterId) {
          const scenes = [...ch.scenes];
          scenes.splice(newIndex, 0, { ...scene, updatedAt: now });
          return {
            ...ch,
            scenes: scenes.map((sc, i) => ({ ...sc, order: i })),
            updatedAt: now,
          };
        }
        return ch;
      }),
    })));
    scenesApi.updateScene(sceneId, { chapter_id: toChapterId, order: newIndex }).catch(syncError);
  },
}));

// Migration helper: upload localStorage projects to Supabase
async function migrateLocalProjects(localProjects: Project[]) {
  for (const proj of localProjects) {
    try {
      const db = await projectsApi.createProject(proj.title, proj.summary, proj.genre);
      for (const ch of proj.chapters) {
        const dbCh = await chaptersApi.createChapter(db.id, ch.title, ch.order);
        for (const sc of ch.scenes) {
          const dbSc = await scenesApi.createScene(db.id, dbCh.id, sc.title, sc.order);
          if (sc.content) {
            await scenesApi.updateScene(dbSc.id, { content: sc.content, word_count: sc.wordCount });
          }
        }
      }
    } catch (e) {
      console.error('Migration error for project:', proj.title, e);
    }
  }
}
