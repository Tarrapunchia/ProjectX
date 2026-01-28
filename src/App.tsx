import { useState } from 'react';
import './App.css';
import Header from './components/header';
import Sidebar from './components/sidebar';
import Footer from './components/footer';
import ProfilePage from './pages/profilePage/profilePage';
import ProjectsPage from './pages/projectsPage/projectsPage';
import type { Projects } from './data/types';

function App() {
	const [activePage, setActivePage] = useState('projects');
	const [selectedProject, setSelectedProject] = useState<Projects | null>(null)
;
	
	return (
		<div className="app-layout">
			<Header setActivePage={setActivePage} selectedProject={selectedProject}/>
			<Sidebar setActivePage={setActivePage} />
			<main className="main-content">
				{ activePage === 'dashboard' && <p>Dashboard (WIP)</p> }
				{ activePage === 'documents' && <p>Documents (WIP)</p> }
				{ activePage === 'tasks' && <p>Tasks (WIP)</p>}
				{ activePage === 'projects' && <ProjectsPage setActivePage={setActivePage} setSelectedProject={setSelectedProject}/> }
				{ activePage === 'chat' && <p>Chat (WIP)</p> }
				{ activePage === 'files' && <p>Files (WIP)</p> }
				{ activePage === 'settings' && <p>Settings (WIP)</p> }
				{ activePage === 'profile' && <ProfilePage /> }
			</main>
			<Footer />
		</div>
	);
}

export default App;