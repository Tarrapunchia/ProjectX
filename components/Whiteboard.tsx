
import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement, ElementType } from '../types';
import { generateCanvasDesign } from '../services/geminiService';

const Whiteboard: React.FC = () => {
  const [elements, setElements] = useState<CanvasElement[]>([
    { id: '1', type: 'rect', x: 100, y: 100, width: 150, height: 100, fill: '#4f46e5' },
    { id: '2', type: 'circle', x: 300, y: 150, width: 80, height: 80, fill: '#10b981' },
    { id: '3', type: 'text', x: 100, y: 250, width: 200, height: 30, fill: '#1e293b', text: 'Visual Brainstorming' },
  ]);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<ElementType | 'select'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool !== 'select') {
      const newEl: CanvasElement = {
        id: Date.now().toString(),
        type: tool,
        x: offsetX,
        y: offsetY,
        width: tool === 'text' ? 150 : 10,
        height: tool === 'text' ? 40 : 10,
        fill: '#cbd5e1',
        text: tool === 'text' ? 'New Text' : undefined
      };
      setElements([...elements, newEl]);
      setSelectedId(newEl.id);
      setTool('select');
      return;
    }

    const clickedEl = elements.findLast(el => {
      if (el.type === 'circle') {
        const dx = offsetX - (el.x + el.width/2);
        const dy = offsetY - (el.y + el.height/2);
        return Math.sqrt(dx*dx + dy*dy) < el.width/2;
      }
      return offsetX >= el.x && offsetX <= el.x + el.width && offsetY >= el.y && offsetY <= el.y + el.height;
    });

    if (clickedEl) {
      setSelectedId(clickedEl.id);
      setIsDragging(true);
      dragStartPos.current = { x: offsetX - clickedEl.x, y: offsetY - clickedEl.y };
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId) return;
    const { offsetX, offsetY } = e.nativeEvent;

    setElements(elements.map(el => 
      el.id === selectedId 
        ? { ...el, x: offsetX - dragStartPos.current.x, y: offsetY - dragStartPos.current.y } 
        : el
    ));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMagicGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    const newDesign = await generateCanvasDesign(aiPrompt);
    const positionedDesign = newDesign.map((el, i) => ({
      ...el,
      id: `ai-${Date.now()}-${i}`,
    }));
    setElements([...elements, ...positionedDesign]);
    setAiPrompt('');
    setIsGenerating(false);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-slate-50">
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Canvas Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50 ring-1 ring-slate-200">
        <button 
          onClick={() => setTool('select')}
          className={`p-2 rounded-xl transition-all ${tool === 'select' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
        <button 
          onClick={() => setTool('rect')}
          className={`p-2 rounded-xl transition-all ${tool === 'rect' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16v12H4z" /></svg>
        </button>
        <button 
          onClick={() => setTool('circle')}
          className={`p-2 rounded-xl transition-all ${tool === 'circle' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={2}/></svg>
        </button>
        <button 
          onClick={() => setTool('text')}
          className={`p-2 rounded-xl transition-all ${tool === 'text' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        {selectedId && (
          <>
            <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
            <button 
              onClick={deleteSelected}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </>
        )}
      </div>

      {/* AI Design Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-xl">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-lg p-2 rounded-2xl shadow-2xl border border-white/50 ring-1 ring-slate-200">
          <div className="p-2 text-indigo-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95l1.419 2.812 3.12.454a1 1 0 01.554 1.705l-2.257 2.2 1.419 2.812a1 1 0 01-1.454 1.056L10 11.666l-2.597 1.37a1 1 0 01-1.454-1.056l1.419-2.812-2.257-2.2a1 1 0 01.554-1.705l3.12-.454 1.419-2.812a1 1 0 01.897-.951l.1-.003zM10 2.05L8.517 5.003a1 1 0 01-.752.546l-3.26.474 2.359 2.3a1 1 0 01.288.885l-.557 3.245L9.517 11a1 1 0 01.966 0l2.91 1.54-.557-3.245a1 1 0 01.288-.885l2.359-2.3-3.26-.474a1 1 0 01-.752-.546L10 2.05z" clipRule="evenodd" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Magic Design: 'A user login page' or 'A flowchart for signups'..." 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
            onKeyDown={(e) => e.key === 'Enter' && handleMagicGenerate()}
          />
          <button 
            onClick={handleMagicGenerate}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
          >
            {isGenerating ? 'Generating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <svg 
        ref={svgRef}
        className="flex-1 w-full h-full cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elements.map((el) => {
          const isSelected = el.id === selectedId;
          const commonProps = {
            key: el.id,
            onMouseDown: (e: React.MouseEvent) => {
              if (tool === 'select') {
                e.stopPropagation();
                setSelectedId(el.id);
                setIsDragging(true);
                const { offsetX, offsetY } = e.nativeEvent;
                dragStartPos.current = { x: offsetX - el.x, y: offsetY - el.y };
              }
            },
            className: `transition-all duration-75 cursor-move ${isSelected ? 'stroke-indigo-500 stroke-[3px]' : 'stroke-transparent'}`,
          };

          if (el.type === 'rect') {
            return (
              <rect 
                {...commonProps}
                x={el.x} 
                y={el.y} 
                width={el.width} 
                height={el.height} 
                fill={el.fill} 
                rx={8}
                fillOpacity={0.9}
              />
            );
          } else if (el.type === 'circle') {
            return (
              <circle 
                {...commonProps}
                cx={el.x + el.width/2} 
                cy={el.y + el.height/2} 
                r={el.width/2} 
                fill={el.fill} 
                fillOpacity={0.9}
              />
            );
          } else if (el.type === 'text') {
            return (
              <text 
                {...commonProps}
                x={el.x} 
                y={el.y + 20} 
                fill={el.fill}
                className="font-bold text-sm select-none"
              >
                {el.text}
              </text>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};

export default Whiteboard;
