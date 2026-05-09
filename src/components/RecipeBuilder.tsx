import { useState } from 'react';
import { useRecipeStore } from '../store/useRecipeStore';
import { usePaintStore } from '../store/usePaintStore';
import { Plus, Trash2, Save, ChevronRight, Palette } from 'lucide-react';
import { Recipe, RecipeStep } from '../types/paint';

export function RecipeBuilder() {
  const { recipes, addRecipe, deleteRecipe } = useRecipeStore();
  const { paints } = usePaintStore();
  const [isCreating, setIsCreating] = useState(false);
  
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    modelName: '',
    steps: []
  });

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

  const handleSave = () => {
    if (!newRecipe.name) return;
    
    addRecipe({
      id: crypto.randomUUID(),
      name: newRecipe.name,
      modelName: newRecipe.modelName,
      steps: newRecipe.steps || [],
      author: 'SkdSam'
    } as Recipe);
    
    setIsCreating(false);
    setNewRecipe({ name: '', modelName: '', steps: [] });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Recipe Vault</h2>
          <p className="text-text-muted text-sm mt-1">Archive your painting process for consistent results across your army.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-brand-primary hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20"
          >
            <Plus size={20} />
            NEW RECIPE
          </button>
        )}
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

                <input 
                  type="text" 
                  placeholder="Technique (e.g. Edge Highlight)"
                  className="bg-bg-dark border border-border rounded-lg px-3 py-2 text-sm text-white flex-1"
                  value={step.technique}
                  onChange={e => {
                    const steps = [...(newRecipe.steps || [])];
                    steps[index].technique = e.target.value;
                    setNewRecipe(prev => ({ ...prev, steps }));
                  }}
                />

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
              <Save size={20} /> SAVE RECIPE
            </button>
            <button 
              onClick={() => setIsCreating(false)}
              className="px-8 bg-white/5 hover:bg-white/10 text-text-muted py-3 rounded-xl font-bold transition-all"
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="grimdark-panel p-6 rounded-2xl group hover:border-brand-primary/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{recipe.name}</h3>
                  <p className="text-text-muted text-xs uppercase tracking-widest">{recipe.modelName}</p>
                </div>
                <button 
                  onClick={() => deleteRecipe(recipe.id)}
                  className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
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

              <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold tracking-widest text-text-muted hover:text-white transition-all uppercase">
                View Full Guide
              </button>
            </div>
          ))}

          {recipes.length === 0 && (
            <div className="col-span-full h-64 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-text-muted opacity-50">
              <Palette size={48} className="mb-4" />
              <p>No recipes saved yet.</p>
              <button onClick={() => setIsCreating(true)} className="text-brand-primary text-sm font-bold mt-2 hover:underline">Create your first recipe</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
