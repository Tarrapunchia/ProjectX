import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import ProfilePage from '../profilePage/profilePage';
import ProjectsPage from '../projectsPage/projectsPage';
import ChatPage from '../chatRoomPage/chatRoomPage';
import DashboardProfile from '../dashboardProfile/dashboardProfile'
import DocumentsPage from '../DocumentsPage/DocumentsPage';
import LibraryPage from '../libraryPage/libraryPage'
import SettingsPage from '../settingsPage/settingsPage';
import type { ProjectInfo } from '../../data/types';
import { WebSocketProvider } from '../../utilities/WebSocketContext'
import FloatingChat from '../../components/FloatingChat/FloatingChat';

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
			<div className="grid h-screen overflow-hidden grid-cols-[75px_1fr] md:grid-cols-[11vw_1fr] grid-rows-[auto_1fr_auto] [grid-template-areas:'sidebar_header''sidebar_main''sidebar_footer']">
				<Header className="[grid-area:header]" setActivePage={setActivePage} selectedProject={selectedProject}/>
				<Sidebar className="[grid-area:sidebar]" setActivePage={setActivePage} />
				<main className="[grid-area:main] p-[20px] overflow-y-auto h-full min-w-0">
					{ activePage === 'dashboard' && <DashboardProfile /> }
					{ activePage === 'documents' && <DocumentsPage selectedProject={selectedProject}/> }
					{ activePage === 'tasks' && <p>Tasks (WIP)</p>}
					{/* { activePage === 'organization' && <ProjectsPage setActivePage={setActivePage} setSelectedProject={setSelectedProject}/> } */}
					{ activePage === 'projects' && <ProjectsPage setActivePage={setActivePage} setSelectedProject={setSelectedProject}/> }
					{ activePage === 'chat' && <ChatPage selectedProject={selectedProject}/> }
					{ activePage === 'files' && <LibraryPage selectedProject={selectedProject}/> }
					{ activePage === 'settings' && <SettingsPage /> }
					{ activePage === 'profile' && <ProfilePage /> }
				</main>
				<footer className="[grid-area:footer] bg-side-bg-color text-text-main py-2.5 px-5 text-center w-full border-t border-overlay-border-color min-w-0">
					<p className="m-0 text-[14px]">© 2026 - Trascendence</p>
				</footer>
				<FloatingChat />
			</div>
		</WebSocketProvider>
    );
}

export default DashboardPage;