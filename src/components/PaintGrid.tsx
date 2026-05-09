import { useMemo, useState } from 'react';
import { usePaintStore } from '../store/usePaintStore';
import { PaintCard } from './PaintCard';
import { Search, SlidersHorizontal } from 'lucide-react';

interface PaintGridProps {
  filterMode: 'all' | 'owned' | 'wishlist';
}

export function PaintGrid({ filterMode }: PaintGridProps) {
  const { 
    paints, 
    userPaints, 
    searchQuery, 
    setSearchQuery, 
    filterBrands, 
    toggleFilterBrand,
    clearFilterBrands,
    filterTypes, 
    toggleFilterType,
    clearFilterTypes
  } = usePaintStore();

  const filteredPaints = useMemo(() => {
    return paints.filter(paint => {
      // Filter by search
      const matchesSearch = paint.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Filter by brand
      if (filterBrands.length > 0 && !filterBrands.includes(paint.brand)) return false;

      // Filter by type
      if (filterTypes.length > 0 && !filterTypes.includes(paint.type)) return false;

      // Filter by mode
      if (filterMode === 'owned') return userPaints[paint.id]?.owned;
      if (filterMode === 'wishlist') return userPaints[paint.id]?.wishlist;
      
      return true;
    });
  }, [paints, userPaints, searchQuery, filterBrands, filterTypes, filterMode]);

  const [showFilters, setShowFilters] = useState(false);

  const uniqueBrands = useMemo(() => Array.from(new Set(paints.map(p => p.brand))), [paints]);
  const uniqueTypes = useMemo(() => Array.from(new Set(paints.map(p => p.type))), [paints]);

  const hasActiveFilters = filterBrands.length > 0 || filterTypes.length > 0 || searchQuery;

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">
            {filterMode === 'all' ? 'Paint Catalog' : filterMode === 'owned' ? 'Inventory' : 'Wishlist'}
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Showing {filteredPaints.length} paints from your collection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search paints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 transition-all w-64"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 bg-bg-surface border border-border rounded-lg transition-all relative ${showFilters ? 'text-brand-primary border-brand-primary' : 'text-text-muted hover:text-white hover:border-brand-primary'}`}
          >
            <SlidersHorizontal size={18} />
            {(filterBrands.length > 0 || filterTypes.length > 0) && !showFilters && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-primary rounded-full border-2 border-bg-dark" />
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 mb-6">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mr-2">Active Filters:</span>
          {filterBrands.map(brand => (
            <span key={`brand-${brand}`} className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-md border border-brand-primary/20 flex items-center gap-1">
              Brand: {brand}
              <button onClick={() => toggleFilterBrand(brand)} className="hover:text-white">×</button>
            </span>
          ))}
          {filterTypes.map(type => (
            <span key={`type-${type}`} className="px-2 py-1 bg-brand-accent/10 text-brand-accent text-xs font-bold rounded-md border border-brand-accent/20 flex items-center gap-1">
              Type: {type}
              <button onClick={() => toggleFilterType(type)} className="hover:text-bg-dark">×</button>
            </span>
          ))}
          {searchQuery && (
            <span className="px-2 py-1 bg-white/5 text-text-primary text-xs font-bold rounded-md border border-white/10 flex items-center gap-1">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery('')} className="hover:text-brand-primary">×</button>
            </span>
          )}
          <button 
            onClick={() => {
              clearFilterBrands();
              clearFilterTypes();
              setSearchQuery('');
            }}
            className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Filter Bar */}
      {showFilters && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8 p-4 bg-white/5 border border-white/5 rounded-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Brand</label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={clearFilterBrands}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterBrands.length === 0 ? 'bg-brand-primary text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
              >
                All
              </button>
              {uniqueBrands.map(brand => (
                <button
                  key={brand}
                  onClick={() => toggleFilterBrand(brand)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterBrands.includes(brand) ? 'bg-brand-primary text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Type</label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={clearFilterTypes}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterTypes.length === 0 ? 'bg-brand-accent text-bg-dark' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
              >
                All
              </button>
              {uniqueTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterTypes.includes(type) ? 'bg-brand-accent text-bg-dark' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredPaints.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredPaints.map(paint => (
            <PaintCard key={paint.id} paint={paint} />
          ))}
        </div>
      ) : (
        <div className="h-[50vh] flex flex-col items-center justify-center text-text-muted">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Search size={32} className="opacity-20" />
          </div>
          <p className="text-lg font-medium">No paints found</p>
          <p className="text-sm">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
}
