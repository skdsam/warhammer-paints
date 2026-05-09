import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Paint, UserPaint } from '../types/paint';
import { ALL_PAINTS } from '../data/paints';

interface PaintState {
  paints: Paint[];
  userPaints: Record<string, UserPaint>;
  searchQuery: string;
  filterBrands: string[];
  filterTypes: string[];
  
  // Actions
  setSearchQuery: (query: string) => void;
  toggleFilterBrand: (brand: string) => void;
  toggleFilterType: (type: string) => void;
  clearFilterBrands: () => void;
  clearFilterTypes: () => void;
  toggleOwned: (paintId: string) => void;
  toggleWishlist: (paintId: string) => void;
  updateQuantity: (paintId: string, quantity: number) => void;
}

export const usePaintStore = create<PaintState>()(
  persist(
    (set) => ({
      paints: Array.from(new Map(ALL_PAINTS.map(p => [`${p.brand}-${p.name}`, p])).values()),
      userPaints: {},
      searchQuery: '',
      filterBrands: [],
      filterTypes: [],

      setSearchQuery: (query) => set({ searchQuery: query }),
      
      toggleFilterBrand: (brand) => set((state) => ({
        filterBrands: state.filterBrands.includes(brand)
          ? state.filterBrands.filter(b => b !== brand)
          : [...state.filterBrands, brand]
      })),
      
      toggleFilterType: (type) => set((state) => ({
        filterTypes: state.filterTypes.includes(type)
          ? state.filterTypes.filter(t => t !== type)
          : [...state.filterTypes, type]
      })),

      clearFilterBrands: () => set({ filterBrands: [] }),
      clearFilterTypes: () => set({ filterTypes: [] }),

      toggleOwned: (paintId) => set((state) => {
        const current = state.userPaints[paintId] || { paintId, owned: false, wishlist: false, quantity: 0 };
        return {
          userPaints: {
            ...state.userPaints,
            [paintId]: { ...current, owned: !current.owned }
          }
        };
      }),

      toggleWishlist: (paintId) => set((state) => {
        const current = state.userPaints[paintId] || { paintId, owned: false, wishlist: false, quantity: 0 };
        return {
          userPaints: {
            ...state.userPaints,
            [paintId]: { ...current, wishlist: !current.wishlist }
          }
        };
      }),

      updateQuantity: (paintId, quantity) => set((state) => {
        const current = state.userPaints[paintId] || { paintId, owned: false, wishlist: false, quantity: 0 };
        return {
          userPaints: {
            ...state.userPaints,
            [paintId]: { ...current, quantity }
          }
        };
      }),
    }),
    {
      name: 'paint-vault-storage',
      partialize: (state) => ({ 
        userPaints: state.userPaints,
        filterBrands: state.filterBrands,
        filterTypes: state.filterTypes
      }),
    }
  )
);
