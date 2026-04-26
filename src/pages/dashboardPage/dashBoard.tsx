import { useState } from 'react';
import './dashBoard.css';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import Footer from '../../components/footer';
import ProfilePage from '../profilePage/profilePage';
import ProjectsPage from '../projectsPage/projectsPage';
import ChatPage from '../chatRoomPage/chatRoomPage';
import Dashboard from '../dashboardProfile/dashboardProfile'
import type { ProjectInfo } from '../../data/types';
import DocumentsPage from '../DocumentsPage/DocumentsPage';

function dashBoard() {
    const [activePage, setActivePage] = useState('dashboard');
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null)
	
    return (
        <div className="app-layout">
            <Header setActivePage={setActivePage} selectedProject={selectedProject}/>
            <Sidebar setActivePage={setActivePage} />
            <main className="main-content">
                { activePage === 'dashboard' && <Dashboard /> }
                { activePage === 'documents' && <DocumentsPage selectedProject={selectedProject}/> }
                { activePage === 'tasks' && <p>Tasks (WIP)</p>}
                {/* { activePage === 'organization' && <ProjectsPage setActivePage={setActivePage} setSelectedProject={setSelectedProject}/> } */}

                { activePage === 'projects' && <ProjectsPage setActivePage={setActivePage} setSelectedProject={setSelectedProject}/> }
                { activePage === 'chat' && <ChatPage selectedProject={selectedProject}/> }
                { activePage === 'files' && <p>Files (WIP)</p> }
                { activePage === 'settings' && <p>Settings (WIP)</p> }
                { activePage === 'profile' && <ProfilePage /> }
            </main>
            <Footer />
        </div>
    );
}

export default dashBoard;