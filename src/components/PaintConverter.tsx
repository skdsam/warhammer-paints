import { useState, useMemo } from 'react';
import { usePaintStore } from '../store/usePaintStore';
import { PaintCard } from './PaintCard';
import { RefreshCw, Search, ArrowRightLeft } from 'lucide-react';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function colorDistance(hex1: string, hex2: string) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

export function PaintConverter() {
  const { paints } = usePaintStore();
  const [sourcePaintId, setSourcePaintId] = useState(paints[0]?.id || '');
  const [targetBrand, setTargetBrand] = useState('Vallejo');

  const sourcePaint = useMemo(() => 
    paints.find(p => p.id === sourcePaintId), 
  [paints, sourcePaintId]);

  const brands = useMemo(() => 
    Array.from(new Set(paints.map(p => p.brand))), 
  [paints]);

  const matches = useMemo(() => {
    if (!sourcePaint) return [];
    
    const sorted = paints
      .filter(p => p.brand === targetBrand && p.id !== sourcePaint.id)
      .sort((a, b) => colorDistance(a.hex, sourcePaint.hex) - colorDistance(b.hex, sourcePaint.hex));

    const uniqueMatches = [];
    const seenNames = new Set();
    for (const p of sorted) {
      if (!seenNames.has(p.name)) {
        seenNames.add(p.name);
        uniqueMatches.push(p);
      }
      if (uniqueMatches.length >= 4) break;
    }
    
    return uniqueMatches;
  }, [paints, sourcePaint, targetBrand]);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-12">
        <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Strategic Conversion</h2>
        <p className="text-text-muted text-sm mt-1">Find the closest equivalent paints across different hobby brands.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Input Section */}
        <div className="grimdark-panel p-8 rounded-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ArrowRightLeft size={120} />
          </div>

          <div className="space-y-4 relative z-10">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Source Paint</label>
            <div className="flex gap-4">
              <select 
                className="flex-1 bg-black/40 border border-border rounded-xl px-4 py-3 text-white focus:border-brand-primary outline-none transition-all"
                value={sourcePaintId}
                onChange={e => setSourcePaintId(e.target.value)}
              >
                {paints.map(p => (
                  <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                ))}
              </select>
            </div>
            {sourcePaint && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg shadow-lg" style={{ backgroundColor: sourcePaint.hex }} />
                <div>
                  <p className="font-bold text-white">{sourcePaint.name}</p>
                  <p className="text-xs text-text-muted uppercase tracking-widest">{sourcePaint.brand} • {sourcePaint.type}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 relative z-10">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Target Brand</label>
            <div className="flex flex-wrap gap-2">
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setTargetBrand(brand)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                    targetBrand === brand 
                      ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                      : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <RefreshCw size={18} />
            </div>
            Closest Match
          </h3>

          {matches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matches.map((paint, index) => (
                <div key={paint.id} className="relative group">
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-brand-accent text-bg-dark rounded-full flex items-center justify-center text-[10px] font-black z-10 shadow-lg">
                    {index === 0 ? 'BEST' : `#${index + 1}`}
                  </div>
                  <PaintCard paint={paint} />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-text-muted opacity-50">
              <Search size={32} className="mb-2" />
              <p className="text-sm">No matches found in this brand.</p>
            </div>
          )}

          {sourcePaint && matches[0] && (
            <div className="mt-8 p-6 bg-brand-accent/5 border border-brand-accent/20 rounded-2xl">
              <p className="text-xs text-brand-accent font-bold uppercase tracking-widest mb-4">Technical Analysis</p>
              <div className="flex items-center justify-between gap-4">
                <div className="text-center flex-1">
                  <div className="w-12 h-12 rounded-lg mx-auto mb-2" style={{ backgroundColor: sourcePaint.hex }} />
                  <p className="text-[10px] text-text-muted truncate">{sourcePaint.name}</p>
                </div>
                <ArrowRightLeft className="text-brand-accent opacity-50" size={20} />
                <div className="text-center flex-1">
                  <div className="w-12 h-12 rounded-lg mx-auto mb-2" style={{ backgroundColor: matches[0].hex }} />
                  <p className="text-[10px] text-text-muted truncate">{matches[0].name}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-accent/10">
                <p className="text-[10px] text-text-muted text-center italic">
                  Confidence Score: {Math.round((1 - (colorDistance(sourcePaint.hex, matches[0].hex) / 441)) * 100)}% Match
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
