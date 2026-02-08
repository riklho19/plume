import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type EditorView = 'editor' | 'characters';

interface EditorState {
  projectId: string | null;
  chapterId: string | null;
  sceneId: string | null;
  isSidebarOpen: boolean;
  view: EditorView;
  isCharacterPanelOpen: boolean;
  isVersionPanelOpen: boolean;
  isShareDialogOpen: boolean;

  selectScene: (projectId: string, chapterId: string, sceneId: string) => void;
  selectProject: (projectId: string) => void;
  clearSelection: () => void;
  goHome: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setView: (view: EditorView) => void;
  toggleCharacterPanel: () => void;
  toggleVersionPanel: () => void;
  setShareDialogOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      projectId: null,
      chapterId: null,
      sceneId: null,
      isSidebarOpen: true,
      view: 'editor' as EditorView,
      isCharacterPanelOpen: false,
      isVersionPanelOpen: false,
      isShareDialogOpen: false,

      selectScene: (projectId, chapterId, sceneId) =>
        set({ projectId, chapterId, sceneId, view: 'editor' }),

      selectProject: (projectId) =>
        set({ projectId, chapterId: null, sceneId: null, view: 'editor' }),

      clearSelection: () =>
        set({ chapterId: null, sceneId: null }),

      goHome: () =>
        set({ projectId: null, chapterId: null, sceneId: null, view: 'editor' }),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      setView: (view) => set({ view }),

      toggleCharacterPanel: () =>
        set((state) => ({
          isCharacterPanelOpen: !state.isCharacterPanelOpen,
          isVersionPanelOpen: false,
        })),

      toggleVersionPanel: () =>
        set((state) => ({
          isVersionPanelOpen: !state.isVersionPanelOpen,
          isCharacterPanelOpen: false,
        })),

      setShareDialogOpen: (open) => set({ isShareDialogOpen: open }),
    }),
    {
      name: 'plume-editor',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projectId: state.projectId,
        chapterId: state.chapterId,
        sceneId: state.sceneId,
      }),
    }
  )
);
