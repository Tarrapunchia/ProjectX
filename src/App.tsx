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
			<Header />
			<Sidebar />
			<main className="main-content">
				{ activePage === 'profile' && <ProfilePage /> }
				{ activePage === 'dashboard' && <p>Dashboard (WIP)</p> }
			</main>
			<Footer />
		</div>
	);
}

export default App;