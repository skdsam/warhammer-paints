import { Shield, Download, Trash2, Code, Mail, Globe, User } from 'lucide-react';

export function Settings() {
  const exportData = () => {
    const data = {
      paints: localStorage.getItem('paint-vault-storage'),
      recipes: localStorage.getItem('paint-vault-recipes'),
      armies: localStorage.getItem('paint-vault-armies'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paint-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to delete ALL your data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
      <div className="mb-12">
        <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Command Center</h2>
        <p className="text-text-muted text-sm mt-1">Manage your application state, data backups, and technical preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Data Management */}
        <section className="grimdark-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
            <Download size={20} className="text-brand-primary" />
            <h3 className="font-bold">Data Management</h3>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={exportData}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-white">Export Backup</p>
                <p className="text-[10px] text-text-muted">Download your catalog and recipes as JSON</p>
              </div>
              <Download size={18} className="text-text-muted group-hover:text-brand-primary transition-colors" />
            </button>

            <button 
              onClick={clearAllData}
              className="w-full flex items-center justify-between p-4 bg-red-900/10 hover:bg-red-900/20 rounded-xl border border-red-900/20 transition-all group"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-red-400">Purge Data</p>
                <p className="text-[10px] text-red-400/60">Permanently delete all local inventory and projects</p>
              </div>
              <Trash2 size={18} className="text-red-400" />
            </button>
          </div>
        </section>

        {/* Application Info */}
        <section className="grimdark-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
            <Shield size={20} className="text-brand-accent" />
            <h3 className="font-bold">Author Information</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-brand-primary/20">
                S
              </div>
              <div>
                <p className="text-xl font-bold text-white">SkdSam</p>
                <p className="text-xs text-text-muted">Lead Architect & Hobbyist</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a href="#" className="flex items-center gap-2 p-3 bg-white/5 rounded-xl text-xs text-text-muted hover:text-white transition-all">
                <Code size={14} /> Github
              </a>
              <a href="#" className="flex items-center gap-2 p-3 bg-white/5 rounded-xl text-xs text-text-muted hover:text-white transition-all">
                <Globe size={14} /> Portfolio
              </a>
            </div>
          </div>
        </section>

        {/* System Settings */}
        <section className="grimdark-panel p-6 rounded-2xl col-span-full">
           <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4 mb-6">
            <h3 className="font-bold">Application Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Acrylic Blur</p>
                <p className="text-[10px] text-text-muted">Enable transparency effects (Windows only)</p>
              </div>
              <div className="w-12 h-6 bg-brand-primary rounded-full relative p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
              </div>
            </div>

            <div className="flex items-center justify-between opacity-50 pointer-events-none">
              <div>
                <p className="text-sm font-bold text-white">Auto-Scrape</p>
                <p className="text-[10px] text-text-muted">Background sync with community databases</p>
              </div>
              <div className="w-12 h-6 bg-white/10 rounded-full relative p-1">
                <div className="w-4 h-4 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center text-text-muted text-[10px] uppercase tracking-[0.2em]">
        PaintVault v0.1.0 • Built with Rust & Tauri • Credits: SkdSam
      </div>
    </div>
  );
}
