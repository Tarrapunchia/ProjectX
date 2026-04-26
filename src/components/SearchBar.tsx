import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar: React.FC = () => {
  return (
    <div className="relative w-full max-w-50 md:max-w-75 mr-6">
      {/* Icona di ricerca */}
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
        <FiSearch size={18} />
      </span>
      
      {/* Input */}
      <input
        type="text"
        placeholder="Cerca..."
        className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-overlay-border-color rounded-full text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white transition-all duration-200"
      />
    </div>
  );
};

export default SearchBar;