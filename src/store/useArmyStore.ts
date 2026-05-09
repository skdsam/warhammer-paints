import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ArmyPalette {
  id: string;
  name: string;
  faction: string;
  paintIds: string[];
  notes?: string;
  imageUrl?: string | null;
}

interface ArmyState {
  palettes: ArmyPalette[];
  addPalette: (palette: ArmyPalette) => void;
  removePalette: (id: string) => void;
  updatePalette: (id: string, updates: Partial<ArmyPalette>) => void;
}

export const useArmyStore = create<ArmyState>()(
  persist(
    (set) => ({
      palettes: [],
      addPalette: (palette) => set((state) => ({ palettes: [palette, ...state.palettes] })),
      removePalette: (id) => set((state) => ({ palettes: state.palettes.filter(p => p.id !== id) })),
      updatePalette: (id, updates) => set((state) => ({
        palettes: state.palettes.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
    }),
    { name: 'paint-vault-armies' }
  )
);
