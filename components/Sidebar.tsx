
import React from 'react';
import { ViewType } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'documents', label: 'Documents', icon: Icons.Documents },
    { id: 'whiteboard', label: 'Whiteboard', icon: Icons.Whiteboard },
    { id: 'projects', label: 'Projects', icon: Icons.Projects },
    { id: 'chat', label: 'Team Chat', icon: Icons.Chat },
    { id: 'files', label: 'File Library', icon: Icons.Files },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          S
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">SyncSpace</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={() => setActiveView('settings')}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
        >
          <Icons.Settings />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
