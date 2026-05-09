import { Check, Plus, Heart, Shield, ExternalLink } from 'lucide-react';
import { Paint } from '../types/paint';
import { usePaintStore } from '../store/usePaintStore';
import { useArmyStore } from '../store/useArmyStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useRef, useEffect } from 'react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PaintCardProps {
  paint: Paint;
}

export function PaintCard({ paint }: PaintCardProps) {
  const { userPaints, toggleOwned, toggleWishlist } = usePaintStore();
  const { palettes, updatePalette } = useArmyStore();
  const userData = userPaints[paint.id] || { owned: false, wishlist: false };
  const [showPalettes, setShowPalettes] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPalettes(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleInPalette = (paletteId: string, currentIds: string[]) => {
    const hasPaint = currentIds.includes(paint.id);
    updatePalette(paletteId, {
      paintIds: hasPaint ? currentIds.filter(id => id !== paint.id) : [...currentIds, paint.id]
    });
  };

  const isInAnyArmy = palettes.some(p => p.paintIds.includes(paint.id));

  return (
    <div className="grimdark-panel group relative overflow-visible rounded-xl transition-all duration-300 hover:scale-[1.02] hover:border-brand-primary/50">
      {/* Color Swatch */}
      <div 
        className="h-32 w-full relative paint-card-shadow rounded-t-xl"
        style={{ backgroundColor: paint.hex }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10">
            {paint.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 rounded-b-xl bg-bg-surface">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-text-primary truncate pr-2">{paint.name}</h3>
          <span className="text-[10px] text-text-muted font-medium">{paint.brand}</span>
        </div>
        
        <div className="flex items-center gap-2 mt-4 relative">
          <button 
            onClick={() => toggleOwned(paint.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all",
              userData.owned 
                ? "bg-green-900/30 text-green-400 border border-green-800/50" 
                : "bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary border border-white/10"
            )}
          >
            {userData.owned ? <Check size={14} /> : <Plus size={14} />}
            {userData.owned ? 'OWNED' : 'ADD'}
          </button>
          
          <button 
            onClick={() => toggleWishlist(paint.id)}
            className={cn(
              "p-1.5 rounded-md transition-all border",
              userData.wishlist
                ? "bg-brand-primary/20 text-brand-primary border-brand-primary/40"
                : "bg-white/5 text-text-muted hover:text-brand-primary border-white/10"
            )}
            title="Toggle Wishlist"
          >
            <Heart size={16} fill={userData.wishlist ? "currentColor" : "none"} />
          </button>

          <a 
            href={`https://www.google.com/search?q=${encodeURIComponent(paint.brand + ' ' + paint.name + ' paint')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md transition-all border bg-white/5 text-text-muted hover:text-white border-white/10 flex items-center justify-center"
            title="Search online"
          >
            <ExternalLink size={16} />
          </a>

          <div className="relative flex" ref={dropdownRef}>
            <button 
              onClick={() => setShowPalettes(!showPalettes)}
              className={cn(
                "p-1.5 rounded-md transition-all border",
                showPalettes || isInAnyArmy
                  ? "bg-brand-accent/20 text-brand-accent border-brand-accent/40"
                  : "bg-white/5 text-text-muted hover:text-brand-accent border-white/10"
              )}
              title="Add to Army"
            >
              <Shield size={16} fill={isInAnyArmy ? "currentColor" : "none"} />
            </button>
            
            {showPalettes && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-bg-dark border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                <div className="p-2 border-b border-border bg-white/5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Add to Army</span>
                </div>
                <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                  {palettes.length === 0 ? (
                    <div className="p-3 text-xs text-text-muted text-center italic">No armies created yet. Go to Strategic Armies to create one.</div>
                  ) : (
                    palettes.map(palette => {
                      const hasPaint = palette.paintIds.includes(paint.id);
                      return (
                        <button
                          key={palette.id}
                          onClick={() => toggleInPalette(palette.id, palette.paintIds)}
                          className="w-full text-left px-2 py-2 rounded-lg text-xs font-medium hover:bg-white/5 flex items-center justify-between text-white transition-colors group/item"
                        >
                          <span className="truncate pr-2">{palette.name}</span>
                          {hasPaint ? (
                            <Check size={14} className="text-brand-primary shrink-0" />
                          ) : (
                            <Plus size={14} className="text-white/20 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
