
import React, { useState } from 'react';
import { Project, User } from '../types';
import KanbanBoard from './KanbanBoard';

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'ft_transcendence',
    description: 'Let\'s close this chapter (or die trying)!',
    status: 'active',
    members: [
      { userId: 'u1', name: 'Paperino', avatar: 'https://picsum.photos/id/64/100/100', projectRole: 'Project Manager' },
      { userId: 'u2', name: 'Pippo', avatar: 'https://picsum.photos/id/65/100/100', projectRole: 'Lead Designer' },
      { userId: 'u3', name: 'Paperoga', avatar: 'https://picsum.photos/id/66/100/100', projectRole: 'Backend Engineer' },
    ]
  },
  {
    id: 'p2',
    name: 'Marketing Campaign',
    description: 'Strategy and assets for this year marketing.',
    status: 'active',
    members: [
      { userId: 'u1', name: 'Qui', avatar: 'https://picsum.photos/id/64/100/100', projectRole: 'Marketing Lead' },
      { userId: 'u4', name: 'Quo', avatar: 'https://picsum.photos/id/67/100/100', projectRole: 'Copywriter' },
      { userId: 'u4', name: 'Qua', avatar: 'https://picsum.photos/id/67/100/100', projectRole: 'Maronn'' },
    ]
  }
];

interface ProjectManagementProps {
  currentUser: User;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ currentUser }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: newProjectName,
      description: newProjectDesc,
      status: 'active',
      members: [{ 
        userId: currentUser.id, 
        name: currentUser.name, 
        avatar: currentUser.avatar, 
        projectRole: 'Owner' 
      }]
    };
    setProjects([newProject, ...projects]);
    setNewProjectName('');
    setNewProjectDesc('');
    setShowAddModal(false);
  };

  if (selectedProject) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <button 
            onClick={() => setSelectedProjectId(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Projects
          </button>
        </div>
        <KanbanBoard project={selectedProject} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Workspace Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your team's collaborative efforts.</p>
        </div>
        
        {currentUser.role === 'Admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id}
            onClick={() => setSelectedProjectId(project.id)}
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
               <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wider">
                {project.status}
               </span>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
              {project.name.charAt(0)}
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 mb-6">{project.description}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <div className="flex -space-x-2">
                {project.members.slice(0, 3).map((m, i) => (
                  <img key={i} src={m.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt={m.name} />
                ))}
                {project.members.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold flex items-center justify-center text-slate-500">
                    +{project.members.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-400">{project.members.length} members</span>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Modal for Adding Project */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project Name</label>
                <input 
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                   value={newProjectDesc}
                   onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm min-h-[100px]"
                  placeholder="Describe the scope of this project..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProject}
                className="flex-1 px-4 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
