import { useState, useRef } from 'react';
import { useRecipeStore } from '../store/useRecipeStore';
import { usePaintStore } from '../store/usePaintStore';
import { Plus, Trash2, Save, ChevronRight, Palette, Pencil, Eye, X, BookOpen, Search, Image as ImageIcon } from 'lucide-react';
import { Recipe, RecipeStep } from '../types/paint';

const TECHNIQUES = [
  'Basecoat', 'Layer', 'Wash', 'Glaze', 'Drybrush', 
  'Edge Highlight', 'Contrast', 'Technical', 'Texture', 'Varnish', 'Shade'
];

export function RecipeBuilder() {
  const { recipes, addRecipe, deleteRecipe, updateRecipe } = useRecipeStore();
  const { paints } = usePaintStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    modelName: '',
    imageUrl: '',
    steps: []
  });

  const [searchQuery, setSearchQuery] = useState('');

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
            setNewRecipe(prev => ({ ...prev, imageUrl: canvas.toDataURL('image/jpeg', 0.8) }));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStep = () => {
    setNewRecipe(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { paintId: paints[0].id, technique: 'Basecoat' }]
    }));
  };

  const handleRemoveStep = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index)
    }));
  };

  const handleEdit = (recipe: Recipe) => {
    setNewRecipe({
      name: recipe.name,
      modelName: recipe.modelName,
      imageUrl: recipe.imageUrl || '',
      steps: [...recipe.steps]
    });
    setEditingId(recipe.id);
    setIsCreating(true);
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setNewRecipe({ name: '', modelName: '', steps: [] });
  };

  const handleSave = () => {
    if (!newRecipe.name) return;
    
    if (editingId) {
      updateRecipe(editingId, {
        name: newRecipe.name,
        modelName: newRecipe.modelName,
        imageUrl: newRecipe.imageUrl,
        steps: newRecipe.steps || []
      });
    } else {
      addRecipe({
        id: crypto.randomUUID(),
        name: newRecipe.name,
        modelName: newRecipe.modelName,
        imageUrl: newRecipe.imageUrl,
        steps: newRecipe.steps || [],
        author: 'SkdSam'
      } as Recipe);
    }
    
    handleCloseForm();
  };

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.modelName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Recipe Vault</h2>
          <p className="text-text-muted text-sm mt-1">Archive your painting process for consistent results across your army.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search recipes..."
              className="bg-bg-dark border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-brand-primary outline-none transition-all w-64"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {!isCreating && (
            <button 
              onClick={() => { setIsCreating(true); setEditingId(null); }}
              className="flex items-center gap-2 bg-brand-primary hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 text-sm"
            >
              <Plus size={18} />
              NEW RECIPE
            </button>
          )}
        </div>
      </div>

      {isCreating ? (
        <div className="max-w-4xl grimdark-panel p-8 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Recipe Name</label>
              <input 
                type="text" 
                placeholder="e.g. Ultramarine Power Armor"
                className="w-full bg-black/20 border border-border rounded-xl px-4 py-3 text-white focus:border-brand-primary outline-none transition-all"
                value={newRecipe.name}
                onChange={e => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Model / Unit</label>
              <input 
                type="text" 
                placeholder="e.g. Intercessor Squad"
                className="w-full bg-black/20 border border-border rounded-xl px-4 py-3 text-white focus:border-brand-primary outline-none transition-all"
                value={newRecipe.modelName}
                onChange={e => setNewRecipe(prev => ({ ...prev, modelName: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Model Image</label>
              <div className="flex items-center gap-4 p-4 bg-black/20 border border-border border-dashed rounded-xl">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-primary flex items-center justify-center cursor-pointer overflow-hidden group bg-bg-dark flex-shrink-0 relative transition-all"
                >
                  {newRecipe.imageUrl ? (
                    <img src={newRecipe.imageUrl} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  ) : (
                    <ImageIcon size={32} className="text-text-muted group-hover:text-brand-primary transition-colors" />
                  )}
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/50 ${newRecipe.imageUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'} transition-opacity`}>
                    <Plus size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Upload Reference Image</p>
                  <p className="text-xs text-text-muted mt-1 italic">Will be compressed for local storage. Click the box to pick a file.</p>
                </div>
                {newRecipe.imageUrl && (
                  <button 
                    onClick={() => setNewRecipe(prev => ({ ...prev, imageUrl: '' }))}
                    className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest px-3 py-1 bg-red-500/10 rounded-lg transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Painting Steps</h3>
              <button 
                onClick={handleAddStep}
                className="text-xs font-bold text-brand-primary hover:text-white flex items-center gap-1 transition-colors"
              >
                <Plus size={14} /> ADD STEP
              </button>
            </div>

            {newRecipe.steps?.map((step, index) => (
              <div key={index} className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5 animate-in slide-in-from-left-2 duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="w-8 h-8 rounded-full bg-bg-dark border border-white/10 flex items-center justify-center text-xs font-black text-text-muted">
                  {index + 1}
                </div>
                
                <select 
                  className="bg-bg-dark border border-border rounded-lg px-3 py-2 text-sm text-white flex-1"
                  value={step.paintId}
                  onChange={e => {
                    const steps = [...(newRecipe.steps || [])];
                    steps[index].paintId = e.target.value;
                    setNewRecipe(prev => ({ ...prev, steps }));
                  }}
                >
                  {paints.map(p => (
                    <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                  ))}
                </select>

                <select 
                  className="bg-bg-dark border border-border rounded-lg px-3 py-2 text-sm text-white flex-1"
                  value={step.technique}
                  onChange={e => {
                    const steps = [...(newRecipe.steps || [])];
                    steps[index].technique = e.target.value;
                    setNewRecipe(prev => ({ ...prev, steps }));
                  }}
                >
                  <option value="" disabled>Select Technique</option>
                  {TECHNIQUES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <button 
                  onClick={() => handleRemoveStep(index)}
                  className="text-text-muted hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              className="flex-1 bg-brand-primary hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Save size={20} /> {editingId ? 'UPDATE RECIPE' : 'SAVE RECIPE'}
            </button>
            <button 
              onClick={handleCloseForm}
              className="px-8 bg-white/5 hover:bg-white/10 text-text-muted py-3 rounded-xl font-bold transition-all"
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="grimdark-panel rounded-2xl group hover:border-brand-primary/50 transition-all overflow-hidden flex flex-col">
              {recipe.imageUrl && (
                <div className="h-40 w-full overflow-hidden border-b border-border bg-black/40">
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{recipe.name}</h3>
                    <p className="text-text-muted text-xs uppercase tracking-widest">{recipe.modelName}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleEdit(recipe)}
                    className="text-text-muted hover:text-brand-primary p-1"
                    title="Edit Recipe"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => deleteRecipe(recipe.id)}
                    className="text-text-muted hover:text-red-500 p-1"
                    title="Delete Recipe"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {recipe.steps.slice(0, 3).map((step, i) => {
                  const paint = paints.find(p => p.id === step.paintId);
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: paint?.hex }} />
                      <span className="text-text-muted truncate flex-1">{paint?.name}</span>
                      <ChevronRight size={12} className="text-text-muted opacity-30" />
                    </div>
                  );
                })}
                {recipe.steps.length > 3 && (
                  <p className="text-[10px] text-text-muted italic pl-6">+ {recipe.steps.length - 3} more steps</p>
                )}
              </div>

                <button 
                  onClick={() => setViewingRecipe(recipe)}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold tracking-widest text-text-muted hover:text-white transition-all uppercase flex items-center justify-center gap-2"
                >
                  <Eye size={14} /> View Full Guide
                </button>
              </div>
            </div>
          ))}

          {filteredRecipes.length === 0 && (
            <div className="col-span-full h-64 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-text-muted opacity-50">
              <Palette size={48} className="mb-4" />
              <p>{searchQuery ? 'No recipes match your search.' : 'No recipes saved yet.'}</p>
              {!searchQuery && (
                <button onClick={() => { setIsCreating(true); setEditingId(null); }} className="text-brand-primary text-sm font-bold mt-2 hover:underline">
                  Create your first recipe
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Full Guide Modal / Overlay */}
      {viewingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-dark border border-border w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-4">
                {viewingRecipe.imageUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                    <img src={viewingRecipe.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic">{viewingRecipe.name}</h3>
                  <p className="text-brand-primary text-xs font-bold uppercase tracking-widest">{viewingRecipe.modelName}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingRecipe(null)}
                className="p-2 hover:bg-white/5 rounded-xl text-text-muted hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="space-y-6">
                {viewingRecipe.steps.map((step, index) => {
                  const paint = paints.find(p => p.id === step.paintId);
                  return (
                    <div key={index} className="flex gap-6 items-start">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-brand-primary/20">
                          {index + 1}
                        </div>
                        {index < viewingRecipe.steps.length - 1 && (
                          <div className="w-0.5 h-12 bg-border mt-2" />
                        )}
                      </div>
                      
                      <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: paint?.hex }} />
                          <div>
                            <p className="text-white font-bold text-sm leading-none">{paint?.name}</p>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">{paint?.brand} • {paint?.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-brand-primary/80">
                          <BookOpen size={12} />
                          <p className="text-sm font-medium italic">{step.technique}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-border bg-white/[0.02] flex justify-end gap-4">
              <button 
                onClick={() => { handleEdit(viewingRecipe); setViewingRecipe(null); }}
                className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors"
              >
                <Pencil size={14} /> EDIT RECIPE
              </button>
              <button 
                onClick={() => setViewingRecipe(null)}
                className="bg-brand-primary hover:bg-red-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 uppercase tracking-widest text-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
