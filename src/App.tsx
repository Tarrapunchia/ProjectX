import { useState } from 'react';
import './App.css';
import Header from './components/header';
import Sidebar from './components/sidebar';
import Footer from './components/footer';
import ProfilePage from './pages/profilePage/profilePage';

function App() {
	const [activePage, setActivePage] = useState('profile');

	
	return (
		<div className="app-layout">
			<Header setActivePage={setActivePage} />
			<Sidebar setActivePage={setActivePage} />
			<main className="main-content">
				{ activePage === 'dashboard' && <p>Dashboard (WIP)</p> }
				{ activePage === 'documents' && <p>Documents (WIP)</p> }
				{ activePage === 'projects' && <p>Projects (WIP)</p> }
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