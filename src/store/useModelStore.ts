import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ModelProject {
  id: string;
  name: string;
  imageUrl: string | null;
  paints: string[]; // array of paint IDs
}

interface ModelStore {
  models: ModelProject[];
  addModel: (model: Omit<ModelProject, 'id'>) => void;
  updateModel: (id: string, updates: Partial<ModelProject>) => void;
  deleteModel: (id: string) => void;
  addPaintToModel: (modelId: string, paintId: string) => void;
  removePaintFromModel: (modelId: string, paintId: string) => void;
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      models: [],
      addModel: (model) => set((state) => ({
        models: [...state.models, { ...model, id: crypto.randomUUID() }]
      })),
      updateModel: (id, updates) => set((state) => ({
        models: state.models.map(m => m.id === id ? { ...m, ...updates } : m)
      })),
      deleteModel: (id) => set((state) => ({
        models: state.models.filter(m => m.id !== id)
      })),
      addPaintToModel: (modelId, paintId) => set((state) => ({
        models: state.models.map(m => m.id === modelId && !m.paints.includes(paintId)
          ? { ...m, paints: [...m.paints, paintId] }
          : m
        )
      })),
      removePaintFromModel: (modelId, paintId) => set((state) => ({
        models: state.models.map(m => m.id === modelId
          ? { ...m, paints: m.paints.filter(p => p !== paintId) }
          : m
        )
      }))
    }),
    {
      name: 'paint-vault-models-v2'
    }
  )
);
