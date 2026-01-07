
import React, { useState } from 'react';
import { summarizeDocument, suggestTasks } from '../services/geminiService';

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextContent: string;
}

const AIDrawer: React.FC<AIDrawerProps> = ({ isOpen, onClose, contextContent }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    const result = await summarizeDocument(contextContent);
    setSummary(result);
    setLoading(false);
  };

  const handleGetTasks = async () => {
    setLoading(true);
    const result = await suggestTasks(contextContent);
    setSuggestions(result);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Gemini Assistant
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
          <p className="text-xs text-indigo-700 leading-relaxed font-medium">
            I'm looking at your current document. How can I help you today?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleSummarize}
            disabled={loading}
            className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all text-center"
          >
            Summarize Doc
          </button>
          <button 
            onClick={handleGetTasks}
            disabled={loading}
            className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all text-center"
          >
            Suggest Tasks
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {summary && (
          <div className="space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Summary</h4>
            <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {summary}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Tasks</h4>
            <div className="space-y-2">
              {suggestions.map((task, i) => (
                <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm">
                  <p className="font-bold text-slate-800 text-xs">{task.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100">
        <input 
          type="text" 
          placeholder="Type a custom query..." 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};

export default AIDrawer;
