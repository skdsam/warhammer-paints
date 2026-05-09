import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe, RecipeStep } from '../types/paint';

interface RecipeState {
  recipes: Recipe[];
  activeRecipe: Recipe | null;
  
  addRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  setActiveRecipe: (recipe: Recipe | null) => void;
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set) => ({
      recipes: [],
      activeRecipe: null,

      addRecipe: (recipe) => set((state) => ({
        recipes: [recipe, ...state.recipes]
      })),

      deleteRecipe: (id) => set((state) => ({
        recipes: state.recipes.filter(r => r.id !== id)
      })),

      updateRecipe: (id, updates) => set((state) => ({
        recipes: state.recipes.map(r => r.id === id ? { ...r, ...updates } : r)
      })),

      setActiveRecipe: (recipe) => set({ activeRecipe: recipe }),
    }),
    {
      name: 'paint-vault-recipes',
    }
  )
);
