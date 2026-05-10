import { useState, useRef } from 'react';
import { useArmyStore, ArmyPalette } from '../store/useArmyStore';
import { usePaintStore } from '../store/usePaintStore';
import { Plus, Trash2, Shield, Search, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { PaintCard } from './PaintCard';
import { FACTIONS } from '../data/factions';
import { Paint } from '../types/paint';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Pencil, Check, X as CloseIcon } from 'lucide-react';

export function ArmyPlanner() {
  const { palettes, addPalette, removePalette, updatePalette } = useArmyStore();
  const { paints } = usePaintStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newArmy, setNewArmy] = useState({ name: '', faction: '', customFaction: '', imageUrl: null as string | null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setNewArmy(prev => ({ ...prev, imageUrl: canvas.toDataURL('image/jpeg', 0.8) }));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (!newArmy.name) return;
    const finalFaction = newArmy.faction === 'Custom' ? newArmy.customFaction : newArmy.faction;
    addPalette({
      id: crypto.randomUUID(),
      name: newArmy.name,
      faction: finalFaction || 'Other',
      paintIds: [],
      imageUrl: newArmy.imageUrl
    });
    setIsCreating(false);
    setNewArmy({ name: '', faction: '', customFaction: '', imageUrl: null });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Strategic Armies</h2>
          <p className="text-text-muted text-sm mt-1">Manage core palettes for your various factions and projects.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-brand-primary hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus size={20} /> NEW ARMY
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 p-6 bg-bg-surface border border-brand-primary/30 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Project Name</label>
              <input 
                type="text" 
                placeholder="e.g. Hive Fleet Behemoth"
                className="w-full bg-black/20 border border-border rounded-xl px-4 py-2 text-white focus:border-brand-primary outline-none transition-all"
                value={newArmy.name}
                onChange={e => setNewArmy(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Faction</label>
              <select 
                className="w-full bg-black/20 border border-border rounded-xl px-4 py-2 text-white focus:border-brand-primary outline-none transition-all appearance-none"
                value={newArmy.faction}
                onChange={e => setNewArmy(prev => ({ ...prev, faction: e.target.value }))}
              >
                <option value="" className="bg-bg-dark">Select Faction...</option>
                {Object.entries(FACTIONS).map(([game, list]) => (
                  <optgroup key={game} label={game} className="bg-bg-dark font-bold text-brand-primary">
                    {list.map(f => (
                      <option key={f} value={f} className="bg-bg-dark text-white font-normal">{f}</option>
                    ))}
                  </optgroup>
                ))}
                <option value="Custom" className="bg-bg-dark">Other / Custom...</option>
              </select>
            </div>
            {newArmy.faction === 'Custom' && (
              <div className="flex-1 min-w-[200px] space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Custom Faction Name</label>
                <input 
                  type="text" 
                  placeholder="Enter faction name..."
                  className="w-full bg-black/20 border border-border rounded-xl px-4 py-2 text-white focus:border-brand-primary outline-none transition-all"
                  value={newArmy.customFaction}
                  onChange={e => setNewArmy(prev => ({ ...prev, customFaction: e.target.value }))}
                />
              </div>
            )}
            
            <div className="w-full flex items-center gap-4 mt-2">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleCreateImageUpload} className="hidden" />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-2xl border border-dashed border-white/20 hover:border-brand-primary flex items-center justify-center cursor-pointer overflow-hidden group bg-bg-dark flex-shrink-0"
              >
                {newArmy.imageUrl ? (
                  <img src={newArmy.imageUrl} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                ) : (
                  <ImageIcon size={24} className="text-text-muted group-hover:text-brand-primary transition-colors" />
                )}
                <div className={`absolute flex items-center justify-center bg-black/50 ${newArmy.imageUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'} transition-opacity w-16 h-16 rounded-2xl pointer-events-none`}>
                  <ImageIcon size={20} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-muted">Upload an inspiration image (optional)</p>
                <p className="text-xs text-text-muted/50 mt-1">Images are compressed automatically</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="bg-brand-primary px-6 py-2 rounded-xl font-bold text-white">Create</button>
              <button onClick={() => setIsCreating(false)} className="bg-white/5 px-6 py-2 rounded-xl font-bold text-text-muted">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {palettes.map(palette => (
          <ArmyPaletteCard 
            key={palette.id} 
            palette={palette} 
            paints={paints} 
            onUpdate={updatePalette} 
            onRemove={removePalette} 
          />
        ))}

        {palettes.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-text-muted bg-white/5 rounded-3xl border border-dashed border-border opacity-50">
            <Shield size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No armies planned yet</p>
            <p className="text-sm">Start by creating a new strategic project</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ArmyPaletteCard({ palette, paints, onUpdate, onRemove }: { 
  palette: ArmyPalette, 
  paints: Paint[], 
  onUpdate: (id: string, updates: Partial<ArmyPalette>) => void,
  onRemove: (id: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddingPaint, setIsAddingPaint] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: palette.name, faction: palette.faction });
  const [paintSearch, setPaintSearch] = useState('');

  const filteredPaints = paints.filter(p => 
    !palette.paintIds.includes(p.id) && 
    (p.name.toLowerCase().includes(paintSearch.toLowerCase()) || 
     p.brand.toLowerCase().includes(paintSearch.toLowerCase()))
  ).slice(0, 100);

  const handleAddPaint = (paintId: string) => {
    onUpdate(palette.id, { paintIds: [...palette.paintIds, paintId] });
    setIsAddingPaint(false);
    setPaintSearch('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            onUpdate(palette.id, { imageUrl: canvas.toDataURL('image/jpeg', 0.8) });
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const openInspiration = async () => {
    const url = `https://www.google.com/search?q=Warhammer+${encodeURIComponent(palette.name)}+painting+guide+images&tbm=isch`;
    try {
      await openUrl(url);
    } catch (err) {
      console.error('Failed to open inspiration link:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-2xl border border-dashed border-white/20 hover:border-brand-primary flex items-center justify-center cursor-pointer overflow-hidden group bg-bg-dark flex-shrink-0 relative"
            title="Upload Reference Image"
          >
            {palette.imageUrl ? (
              <img src={palette.imageUrl} alt={palette.name} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
            ) : (
              <ImageIcon size={24} className="text-text-muted group-hover:text-brand-primary transition-colors" />
            )}
            <div className={`absolute inset-0 flex items-center justify-center bg-black/50 ${palette.imageUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'} transition-opacity`}>
              <ImageIcon size={20} className="text-white" />
            </div>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                className="bg-black/20 border border-brand-primary/50 rounded-lg px-3 py-1 text-white text-lg font-bold focus:outline-none"
                value={editData.name}
                onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                autoFocus
              />
              <input 
                type="text" 
                className="bg-black/20 border border-border rounded-lg px-3 py-1 text-text-muted text-xs focus:outline-none"
                value={editData.faction}
                onChange={e => setEditData(prev => ({ ...prev, faction: e.target.value }))}
              />
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-white">{palette.name}</h3>
              <p className="text-text-muted text-sm font-medium">{palette.faction}</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  onUpdate(palette.id, { name: editData.name, faction: editData.faction });
                  setIsEditing(false);
                }}
                className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                title="Save Changes"
              >
                <Check size={20} />
              </button>
              <button 
                onClick={() => {
                  setEditData({ name: palette.name, faction: palette.faction });
                  setIsEditing(false);
                }}
                className="p-2 text-text-muted hover:bg-white/5 rounded-lg transition-colors"
                title="Cancel"
              >
                <CloseIcon size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 text-text-muted hover:text-brand-primary transition-colors"
              title="Edit Army Info"
            >
              <Pencil size={18} />
            </button>
          )}
          {isAddingPaint ? (
            <div className="relative z-30">
              <input
                type="text"
                autoFocus
                value={paintSearch}
                onChange={(e) => setPaintSearch(e.target.value)}
                placeholder="Search paints to add..."
                className="w-48 bg-black/20 border border-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-primary"
              />
              <div className="absolute right-0 top-full mt-1 w-64 bg-bg-surface border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto z-40 custom-scrollbar">
                {filteredPaints.map(paint => (
                  <button
                    key={paint.id}
                    onClick={() => handleAddPaint(paint.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: paint.hex }} />
                    <span className="text-sm truncate">{paint.name} <span className="text-text-muted text-[10px]">({paint.brand})</span></span>
                  </button>
                ))}
                {filteredPaints.length === 0 && (
                  <div className="px-3 py-3 text-sm text-text-muted text-center italic">No paints found</div>
                )}
              </div>
              <button 
                onClick={() => setIsAddingPaint(false)}
                className="absolute -top-6 right-0 text-xs text-text-muted hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingPaint(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border rounded-lg text-text-muted text-sm hover:text-white hover:border-brand-primary transition-colors"
            >
              <Plus size={14} /> Add Paint
            </button>
          )}

          <button 
            onClick={openInspiration}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-text-muted transition-all ml-2"
          >
            <ExternalLink size={14} /> INSPIRATION
          </button>
          <button 
            onClick={() => onRemove(palette.id)}
            className="p-2 text-text-muted hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {palette.paintIds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {palette.paintIds.map(pid => {
            const paint = paints.find(p => p.id === pid);
            return paint ? <PaintCard key={pid} paint={paint} /> : null;
          })}
        </div>
      ) : (
        <div className="h-32 bg-white/5 rounded-2xl border border-dashed border-border flex items-center justify-center text-text-muted italic text-sm">
          No paints added to this palette yet. Click "Add Paint" above to search and add paints directly.
        </div>
      )}
    </div>
  );
}
