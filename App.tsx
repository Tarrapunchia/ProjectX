
import React, { useState, useEffect } from 'react';
import { ViewType, User } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DocumentEditor from './components/DocumentEditor';
import KanbanBoard from './components/KanbanBoard';
import ChatRoom from './components/ChatRoom';
import FileManager from './components/FileManager';
import AIDrawer from './components/AIDrawer';
import Whiteboard from './components/Whiteboard';

const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Rivera',
  avatar: 'https://picsum.photos/id/64/100/100',
  role: 'Admin',
  status: 'online',
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [currentDocumentContent, setCurrentDocumentContent] = useState('');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'documents':
        return <DocumentEditor onContentChange={setCurrentDocumentContent} />;
      case 'whiteboard':
        return <Whiteboard />;
      case 'projects':
        return <KanbanBoard />;
      case 'chat':
        return <ChatRoom currentUser={MOCK_USER} />;
      case 'files':
        return <FileManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          user={MOCK_USER} 
          activeView={activeView} 
          toggleAi={() => setIsAiDrawerOpen(!isAiDrawerOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto relative bg-[#f1f5f9]">
          <div className={`${activeView === 'whiteboard' ? 'h-full' : 'max-w-7xl mx-auto h-full p-6 lg:p-10'}`}>
            {renderView()}
          </div>
        </main>
      </div>

      {/* AI Side Drawer */}
      <AIDrawer 
        isOpen={isAiDrawerOpen} 
        onClose={() => setIsAiDrawerOpen(false)} 
        contextContent={currentDocumentContent}
      />
    </div>
  );
};

export default App;
