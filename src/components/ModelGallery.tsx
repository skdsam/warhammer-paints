import { useState, useRef, useMemo } from 'react';
import { useModelStore, ModelProject } from '../store/useModelStore';
import { usePaintStore } from '../store/usePaintStore';
import { Plus, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { Paint } from '../types/paint';

export function ModelGallery({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const { models, addModel, deleteModel, addPaintToModel, removePaintFromModel } = useModelStore();
  const { paints, clearFilterBrands, clearFilterTypes, setSearchQuery } = usePaintStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelImage, setNewModelImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            setNewModelImage(canvas.toDataURL('image/jpeg', 0.8));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateModel = () => {
    if (newModelName.trim()) {
      addModel({
        name: newModelName.trim(),
        imageUrl: newModelImage,
        paints: []
      });
      setIsCreating(false);
      setNewModelName('');
      setNewModelImage(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Model Gallery
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Track your painted models and the colors used on them
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-primary/90 transition-colors"
        >
          <Plus size={18} />
          Add Model
        </button>
      </div>

      {isCreating && (
        <div className="bg-bg-surface border border-border p-6 rounded-2xl mb-8 animate-in slide-in-from-top-2">
          <h3 className="text-xl font-bold text-white mb-4">New Model</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Model Name</label>
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="e.g. Ultramarine Intercessor"
                className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary transition-colors bg-bg-dark overflow-hidden relative"
              >
                {newModelImage ? (
                  <img src={newModelImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon size={32} className="text-text-muted mb-2" />
                    <span className="text-sm text-text-muted">Click to upload image</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg text-text-muted hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateModel}
                disabled={!newModelName.trim()}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/90 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {models.map(model => (
          <ModelCard
            key={model.id}
            model={model}
            paints={paints}
            onDelete={() => deleteModel(model.id)}
            onAddPaint={(paintId) => addPaintToModel(model.id, paintId)}
            onRemovePaint={(paintId) => removePaintFromModel(model.id, paintId)}
            onPaintClick={(paintName) => {
              clearFilterBrands();
              clearFilterTypes();
              setSearchQuery(paintName.trim());
              setActiveTab?.('all');
            }}
          />
        ))}
      </div>
      
      {models.length === 0 && !isCreating && (
        <div className="h-[40vh] flex flex-col items-center justify-center text-text-muted">
          <ImageIcon size={48} className="opacity-20 mb-4" />
          <p className="text-xl font-medium">No models yet</p>
          <p className="text-sm mt-2">Add your first model to track the paints you used.</p>
        </div>
      )}
    </div>
  );
}

function ModelCard({ 
  model, 
  paints, 
  onDelete, 
  onAddPaint, 
  onRemovePaint,
  onPaintClick
}: { 
  model: ModelProject, 
  paints: Paint[], 
  onDelete: () => void,
  onAddPaint: (paintId: string) => void,
  onRemovePaint: (paintId: string) => void,
  onPaintClick: (paintName: string) => void
}) {
  const [isAddingPaint, setIsAddingPaint] = useState(false);
  const [paintSearch, setPaintSearch] = useState('');

  const modelPaints = model.paints
    .map(id => paints.find(p => p.id === id))
    .filter((p): p is Paint => p !== undefined);

  const filteredPaints = useMemo(() => {
    if (!isAddingPaint) return [];
    return paints.filter(p => 
      !model.paints.includes(p.id) && 
      (p.name.toLowerCase().includes(paintSearch.toLowerCase()) || 
       p.brand.toLowerCase().includes(paintSearch.toLowerCase()))
    ).slice(0, 100);
  }, [isAddingPaint, paints, model.paints, paintSearch]);

  return (
    <div className={`bg-bg-surface border border-border rounded-xl flex flex-col group relative transition-all ${isAddingPaint ? 'z-40 ring-1 ring-brand-primary' : 'z-10 hover:z-20'}`}>
      <button 
        onClick={onDelete}
        className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
      >
        <Trash2 size={16} />
      </button>
      
      <div className="h-48 w-full bg-bg-dark relative rounded-t-xl overflow-hidden">
        {model.imageUrl ? (
          <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={32} className="text-text-muted/30" />
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-4">{model.name}</h3>
        
        {/* Color Bars */}
        <div className="flex flex-wrap gap-2 mb-4">
          {modelPaints.map(paint => (
            <div 
              key={paint.id}
              onClick={(e) => {
                e.stopPropagation();
                onPaintClick(paint.name);
              }}
              className="relative z-20 group/paint cursor-pointer w-8 h-8 rounded-full border border-border shadow-sm flex-shrink-0"
              style={{ backgroundColor: paint.hex }}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePaint(paint.id);
                }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/paint:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover/paint:opacity-100 whitespace-nowrap pointer-events-none z-20">
                {paint.brand} - {paint.name}
              </div>
            </div>
          ))}
          {modelPaints.length === 0 && (
            <span className="text-xs text-text-muted italic">No paints added yet</span>
          )}
        </div>

        <div className="mt-auto">
          {isAddingPaint ? (
            <div className="space-y-2 relative">
              <input
                type="text"
                autoFocus
                value={paintSearch}
                onChange={(e) => setPaintSearch(e.target.value)}
                placeholder="Search paints..."
                className="w-full bg-bg-dark border border-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-primary"
              />
              <div className="absolute left-0 right-0 top-full mt-1 bg-bg-surface border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto z-30">
                {filteredPaints.map(paint => (
                  <button
                    key={paint.id}
                    onClick={() => {
                      onAddPaint(paint.id);
                      setIsAddingPaint(false);
                      setPaintSearch('');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: paint.hex }} />
                    <span className="text-sm truncate">{paint.name} <span className="text-text-muted text-xs">({paint.brand})</span></span>
                  </button>
                ))}
                {filteredPaints.length === 0 && (
                  <div className="px-3 py-2 text-sm text-text-muted">No paints found</div>
                )}
              </div>
              <button 
                onClick={() => setIsAddingPaint(false)}
                className="text-xs text-text-muted hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingPaint(true)}
              className="w-full py-1.5 border border-dashed border-border rounded-lg text-text-muted text-sm hover:text-white hover:border-brand-primary transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={14} /> Add Paint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
