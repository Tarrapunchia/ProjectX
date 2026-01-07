
import React from 'react';
import { User, ViewType } from '../types';
import { Icons } from '../constants';

interface HeaderProps {
  user: User;
  activeView: ViewType;
  toggleAi: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeView, toggleAi }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800 capitalize">
          {activeView}
        </h2>
        <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
        <div className="hidden md:flex relative group">
          <input 
            type="text" 
            placeholder="Search workspace..." 
            className="pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
          />
          <svg className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleAi}
          className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full hover:bg-indigo-100 transition-all font-medium text-sm"
        >
          <Icons.AI />
          Ask Gemini
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user.name}</p>
            <p className="text-xs text-slate-500 mt-1">{user.role}</p>
          </div>
          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full ring-2 ring-indigo-50" />
        </div>
      </div>
    </header>
  );
};

export default Header;
