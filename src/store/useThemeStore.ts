import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Theme } from '../types/models';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'plume-theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
