import { useState, useEffect } from 'react';
import './dashBoard.css';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import Footer from '../../components/footer';
import ProfilePage from '../profilePage/profilePage';
import ProjectsPage from '../projectsPage/projectsPage';
import ChatPage from '../chatRoomPage/chatRoomPage';
import DashboardProfile from '../dashboardProfile/dashboardProfile'
import type { ProjectInfo } from '../../data/types';
import DocumentsPage from '../DocumentsPage/DocumentsPage';
import { WebSocketProvider } from '../../utilities/WebSocketContext'

function DashboardPage() {
    const [activePage, setActivePage] = useState(() => {
		return localStorage.getItem('activePage') || 'dashboard';
	});
    const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(() => {
		const saved = localStorage.getItem('selectedProject');
		return saved ? JSON.parse(saved) : null;
	});

	useEffect(() => {
		localStorage.setItem('activePage', activePage);
	}, [activePage]);

	useEffect(() => {
		if (selectedProject)
			localStorage.setItem('selectedProject', JSON.stringify(selectedProject));
		else
			localStorage.removeItem('selectedProject');
	}, [selectedProject]);
	
    return (
		<WebSocketProvider>
			<div className="app-layout">
				<Header setActivePage={setActivePage} selectedProject={selectedProject}/>
				<Sidebar setActivePage={setActivePage} />
				<main className="main-content">
					{ activePage === 'dashboard' && <DashboardProfile /> }
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
		</WebSocketProvider>
    );
}

export default DashboardPage;