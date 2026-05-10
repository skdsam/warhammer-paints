import { useState, useRef } from 'react';
import {
  Download, Upload, Trash2, Shield, Info, Database,
  CheckCircle2, AlertCircle, RotateCcw,
  Palette, ListChecks, Heart, LayoutGrid, BookOpen, Video
} from 'lucide-react';
import { usePaintStore } from '../store/usePaintStore';
import { useArmyStore } from '../store/useArmyStore';
import { useRecipeStore } from '../store/useRecipeStore';
import { useFeedStore } from '../store/useFeedStore';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };
  return { toasts, show };
}

function StatCard({ icon: Icon, label, value, color = 'text-brand-primary' }: {
  icon: React.ElementType; label: string; value: number | string; color?: string;
}) {
  return (
    <div className="bg-bg-dark border border-border rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-[10px] text-text-muted uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function ConfirmButton({
  onConfirm,
  label,
  confirmLabel = 'Confirm',
  className = '',
}: {
  onConfirm: () => void;
  label: React.ReactNode;
  confirmLabel?: string;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Sure?</span>
        <button
          onClick={() => { onConfirm(); setConfirming(false); }}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
        >
          {confirmLabel}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirming(true)} className={className}>
      {label}
    </button>
  );
}

export function Settings() {
  const paintStore = usePaintStore();
  const armyStore = useArmyStore();
  const recipeStore = useRecipeStore();
  const feedStore = useFeedStore();
  const { toasts, show: showToast } = useToast();
  const importRef = useRef<HTMLInputElement>(null);

  // ── Stats ──────────────────────────────────────────────────────────────
  const ownedCount = Object.values(paintStore.userPaints).filter(p => p.owned).length;
  const wishlistCount = Object.values(paintStore.userPaints).filter(p => p.wishlist).length;

  // ── Export ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const defaultName = `paintvault-backup-${new Date().toISOString().split('T')[0]}.json`;
      const filePath = await save({
        title: 'Save PaintVault Backup',
        defaultPath: defaultName,
        filters: [{ name: 'JSON Backup', extensions: ['json'] }],
      });
      if (!filePath) return; // user cancelled

      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        paints: localStorage.getItem('paint-vault-storage'),
        armies: localStorage.getItem('paint-vault-armies'),
        recipes: localStorage.getItem('paint-vault-recipes'),
        feeds: localStorage.getItem('paint-vault-feeds-v4'),
      };
      await writeTextFile(filePath, JSON.stringify(backup, null, 2));
      showToast('Backup saved successfully!');
    } catch (e) {
      console.error(e);
      showToast('Failed to save backup.', 'error');
    }
  };

  // ── Import ─────────────────────────────────────────────────────────────
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const backup = JSON.parse(ev.target?.result as string);
        if (backup.version !== 1) throw new Error('Unknown backup version');
        if (backup.paints) localStorage.setItem('paint-vault-storage', backup.paints);
        if (backup.armies) localStorage.setItem('paint-vault-armies', backup.armies);
        if (backup.recipes) localStorage.setItem('paint-vault-recipes', backup.recipes);
        if (backup.feeds) localStorage.setItem('paint-vault-feeds-v4', backup.feeds);
        showToast('Backup restored! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        showToast('Invalid backup file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Selective resets ───────────────────────────────────────────────────
  const resetInventory = () => {
    localStorage.removeItem('paint-vault-storage');
    showToast('Paint inventory cleared. Reloading...');
    setTimeout(() => window.location.reload(), 1000);
  };
  const resetArmies = () => {
    localStorage.removeItem('paint-vault-armies');
    showToast('Army palettes cleared. Reloading...');
    setTimeout(() => window.location.reload(), 1000);
  };
  const resetRecipes = () => {
    localStorage.removeItem('paint-vault-recipes');
    showToast('Recipes cleared. Reloading...');
    setTimeout(() => window.location.reload(), 1000);
  };
  const resetFeeds = () => {
    localStorage.removeItem('paint-vault-feeds-v4');
    showToast('Creator feeds cleared. Reloading...');
    setTimeout(() => window.location.reload(), 1000);
  };
  const resetAll = () => {
    localStorage.clear();
    showToast('All data cleared. Reloading...');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

      {/* Toast notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-bold pointer-events-auto
              ${t.type === 'success' ? 'bg-emerald-900/90 border border-emerald-700/50 text-emerald-300' : 'bg-red-900/90 border border-red-700/50 text-red-300'}`}
          >
            {t.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Settings</h2>
        <p className="text-text-muted text-sm mt-1">Manage your vault data, backups, and preferences.</p>
      </div>

      {/* Stats overview */}
      <section className="mb-8">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Your Collection</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Palette} label="Total Paints" value={paintStore.paints.length} />
          <StatCard icon={CheckCircle2} label="Owned" value={ownedCount} color="text-emerald-400" />
          <StatCard icon={Heart} label="Wishlisted" value={wishlistCount} color="text-pink-400" />
          <StatCard icon={LayoutGrid} label="Armies" value={armyStore.palettes.length} color="text-violet-400" />
          <StatCard icon={BookOpen} label="Recipes" value={recipeStore.recipes.length} color="text-amber-400" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Backup & Restore */}
        <section className="bg-bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Database size={18} className="text-brand-primary" />
            <div>
              <h3 className="font-bold text-white">Backup & Restore</h3>
              <p className="text-[10px] text-text-muted">Export your data to keep it safe or move it between devices</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-border hover:border-brand-primary/40 rounded-xl transition-all group"
          >
            <div className="text-left">
              <p className="text-sm font-bold text-white">Export Backup</p>
              <p className="text-[10px] text-text-muted mt-0.5">Downloads a .json file with all your inventory, armies, recipes & feeds</p>
            </div>
            <Download size={18} className="text-text-muted group-hover:text-brand-primary transition-colors flex-shrink-0 ml-4" />
          </button>

          <button
            onClick={() => importRef.current?.click()}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-border hover:border-brand-primary/40 rounded-xl transition-all group"
          >
            <div className="text-left">
              <p className="text-sm font-bold text-white">Restore Backup</p>
              <p className="text-[10px] text-text-muted mt-0.5">Import a previously exported .json backup file</p>
            </div>
            <Upload size={18} className="text-text-muted group-hover:text-brand-primary transition-colors flex-shrink-0 ml-4" />
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </section>

        {/* Data Reset */}
        <section className="bg-bg-surface border border-border rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <RotateCcw size={18} className="text-red-400" />
            <div>
              <h3 className="font-bold text-white">Reset Data</h3>
              <p className="text-[10px] text-text-muted">Clear individual sections or wipe everything</p>
            </div>
          </div>

          {[
            { label: 'Paint Inventory', sub: `${ownedCount} owned · ${wishlistCount} wishlisted`, icon: Palette, onConfirm: resetInventory },
            { label: 'Army Palettes', sub: `${armyStore.palettes.length} armies`, icon: LayoutGrid, onConfirm: resetArmies },
            { label: 'Paint Recipes', sub: `${recipeStore.recipes.length} recipes`, icon: BookOpen, onConfirm: resetRecipes },
            { label: 'Creator Feeds', sub: `${feedStore.channels.length} channels`, icon: Video, onConfirm: resetFeeds },
          ].map(({ label, sub, icon: Icon, onConfirm }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <Icon size={15} className="text-text-muted" />
                <div>
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-[10px] text-text-muted">{sub}</p>
                </div>
              </div>
              <ConfirmButton
                onConfirm={onConfirm}
                confirmLabel="Clear"
                label={
                  <span className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 transition-colors font-bold">
                    <Trash2 size={12} /> Clear
                  </span>
                }
              />
            </div>
          ))}

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between p-3 bg-red-950/20 rounded-xl border border-red-900/30">
              <div>
                <p className="text-sm font-bold text-red-400">Reset Everything</p>
                <p className="text-[10px] text-red-400/60">Permanently wipes all data from all sections</p>
              </div>
              <ConfirmButton
                onConfirm={resetAll}
                confirmLabel="Wipe All"
                label={
                  <span className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-300 transition-colors font-bold">
                    <Trash2 size={12} /> Wipe All
                  </span>
                }
              />
            </div>
          </div>
        </section>

      </div>

      <section className="mt-6 bg-bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
          <Info size={18} className="text-brand-primary" />
          <h3 className="font-bold text-white">About PaintVault</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-brand-primary/20">
            S
          </div>
          <div>
            <p className="text-lg font-black text-white">SkdSam</p>
            <p className="text-xs text-text-muted">Lead Architect & Hobby Enthusiast</p>
            <p className="text-[10px] text-text-muted mt-1">PaintVault v0.1.0</p>
          </div>
        </div>
      </section>

    </div>
  );
}
