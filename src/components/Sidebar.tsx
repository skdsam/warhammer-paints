import { LayoutGrid, Palette, ListChecks, Search, Settings, Heart, RefreshCw, Image as ImageIcon, BookOpen, Video } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'all', label: 'All Paints', icon: Palette },
    { id: 'owned', label: 'My Inventory', icon: ListChecks },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'wheel', label: 'Color Wheel', icon: Search },
    { id: 'converter', label: 'Converter', icon: RefreshCw },
    { id: 'armies', label: 'Army Planner', icon: LayoutGrid },
    { id: 'recipes', label: 'Paint Recipes', icon: ListChecks },
    { id: 'tutorials', label: 'Tutorials & Guides', icon: BookOpen },
    { id: 'feeds', label: 'Creator Feeds', icon: Video },
  ];

  return (
    <aside className="w-64 h-screen bg-bg-surface border-r border-border flex flex-col p-4 fixed left-0 top-0 z-10">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-brand-primary rounded shadow-lg shadow-brand-primary/20 flex items-center justify-center">
          <Palette size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary">PaintVault</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/10" 
                  : "text-text-muted hover:bg-white/5 hover:text-text-primary"
              )}
            >
              <Icon size={20} className={cn(
                "transition-colors",
                isActive ? "text-white" : "text-text-muted group-hover:text-text-primary"
              )} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-border mt-auto">
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
            activeTab === 'settings' 
              ? "bg-brand-primary text-white shadow-md shadow-brand-primary/10" 
              : "text-text-muted hover:bg-white/5 hover:text-text-primary"
          )}
        >
          <Settings size={20} className={activeTab === 'settings' ? "text-white" : "text-text-muted group-hover:text-text-primary"} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
