import React from 'react';
import { LayoutDashboard, Settings, Zap, LogOut, Database, Plug } from 'lucide-react';

export type ViewType = 'dashboard' | 'config' | 'knowledge' | 'integrations';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'config', label: 'Agent Config', icon: Settings },
  ] as const;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-vortex-600 p-2 rounded-lg">
            <Zap size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Vortex AI</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-vortex-50 text-vortex-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};