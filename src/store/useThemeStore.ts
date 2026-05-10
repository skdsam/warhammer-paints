import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'grimdark' | 'ultramarine' | 'necron' | 'tau' | 'eldar' | 'custodes' | 'custom';

interface ThemeState {
  theme: AppTheme;
  customColor: string;
  setTheme: (theme: AppTheme) => void;
  setCustomColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'grimdark',
      customColor: '#8b0000',
      setTheme: (theme) => set({ theme }),
      setCustomColor: (customColor) => set({ customColor }),
    }),
    {
      name: 'paint-vault-theme',
    }
  )
);
