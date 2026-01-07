
import React, { useState } from 'react';
import { Task, Project } from '../types';

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Design Landing Page', description: 'Create high-fidelity mockups for the homepage.', status: 'todo', assignee: 'Alex', priority: 'high' },
  { id: 't2', title: 'Setup Gemini SDK', description: 'Integrate the @google/genai library into the service layer.', status: 'in-progress', assignee: 'Sarah', priority: 'high' },
  { id: 't3', title: 'User Authentication', description: 'Implement JWT based auth flow.', status: 'done', assignee: 'Mike', priority: 'medium' },
  { id: 't4', title: 'Mobile Responsiveness', description: 'Ensure the dashboard works on screens < 768px.', status: 'todo', assignee: 'Alex', priority: 'low' },
];

interface KanbanBoardProps {
  project: Project;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ project }) => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const columns = [
    { id: 'todo', label: 'To Do', color: 'bg-slate-500' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-indigo-500' },
    { id: 'done', label: 'Done', color: 'bg-emerald-500' },
  ];

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 gap-8">
      {/* Project Header with Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">{project.name}</h1>
            <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold shadow-md">
              + New Task
            </button>
          </div>
          <p className="text-slate-500 text-sm mb-6">{project.description}</p>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               Due Dec 20, 2024
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
               24 Comments
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center justify-between">
            Team Members
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{project.members.length}</span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {project.members.map((member) => (
              <div key={member.userId} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all">
                <img src={member.avatar} className="w-9 h-9 rounded-full ring-2 ring-indigo-50" alt={member.name} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{member.name}</p>
                  <p className="text-[10px] text-indigo-600 font-medium truncate">{member.projectRole}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 text-xs font-bold text-indigo-600 border border-indigo-50 rounded-lg hover:bg-indigo-50 transition-all">
            Manage Access
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 min-w-[320px] bg-slate-100/50 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">{col.label}</h3>
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                      task.priority === 'high' ? 'bg-red-50 text-red-600' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {task.priority}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">{task.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {task.assignee.charAt(0)}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">{task.assignee}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all text-sm font-medium">
                + Add Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
