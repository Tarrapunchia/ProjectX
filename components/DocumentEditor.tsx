
import React, { useState, useEffect } from 'react';

interface DocumentEditorProps {
  onContentChange: (content: string) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ onContentChange }) => {
  const [content, setContent] = useState('# Project Overview\n\nStart typing to collaborate in real-time...\n\nSyncSpace allows your team to work together on documentation with Gemini-powered insights always a click away.');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    onContentChange(content);
    setIsSaving(true);
    const timeout = setTimeout(() => setIsSaving(false), 1000);
    return () => clearTimeout(timeout);
  }, [content, onContentChange]);

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 bg-slate-100/50 -m-6 lg:-m-10 p-6 lg:p-10 overflow-y-auto">
      {/* Top Sticky Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-6 bg-transparent">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Project Roadmap & Technical Spec</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isSaving ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100'}`}>
                {isSaving ? 'Syncing...' : 'Saved to Cloud'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Last edit was 2 minutes ago</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2 mr-2">
            <img src="https://picsum.photos/id/10/32/32" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="Alex" />
            <img src="https://picsum.photos/id/20/32/32" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" title="Sarah" />
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-600 shadow-sm">+2</div>
          </div>
          <button className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            Share
          </button>
        </div>
      </div>

      {/* Main Paper Surface */}
      <div className="max-w-4xl mx-auto w-full flex-1 bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-200/50 flex flex-col min-h-[1000px] mb-20 transition-all">
        {/* Formatting Toolbar */}
        <div className="border-b border-slate-100 p-3 flex items-center gap-2 bg-slate-50/80 sticky top-0 z-10 rounded-t-xl backdrop-blur-sm">
          <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
            <select className="text-xs font-semibold text-slate-600 bg-transparent outline-none cursor-pointer hover:bg-slate-200/50 p-1 rounded">
              <option>Heading 1</option>
              <option>Heading 2</option>
              <option>Body Text</option>
            </select>
          </div>
          
          <div className="flex items-center gap-0.5">
            {['B', 'I', 'U', 'S'].map((tool) => (
              <button key={tool} className="w-8 h-8 flex items-center justify-center text-xs font-black text-slate-600 hover:bg-white hover:text-indigo-600 rounded-lg transition-all border border-transparent hover:border-slate-200">
                {tool}
              </button>
            ))}
          </div>
          
          <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
          
          <div className="flex items-center gap-0.5">
            <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:text-indigo-600 rounded-lg transition-all border border-transparent hover:border-slate-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:text-indigo-600 rounded-lg transition-all border border-transparent hover:border-slate-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </button>
          </div>
        </div>

        {/* Text Area - Explicitly high contrast */}
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 w-full p-12 lg:p-16 outline-none text-slate-900 bg-white leading-loose font-sans resize-none text-lg selection:bg-indigo-100 placeholder:text-slate-300"
          placeholder="Start writing your masterpiece..."
          spellCheck="false"
        />
        
        {/* Footer Info */}
        <div className="p-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {content.split(/\s+/).filter(x => x.length > 0).length} Words
          </span>
          <div className="flex gap-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">UTF-8</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Markdown Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
