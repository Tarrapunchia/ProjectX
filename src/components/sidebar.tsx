import './sidebar.css';

interface SidebarProps {
	setActivePage: (page: string) => void;
}

function Sidebar({ setActivePage }: SidebarProps) {
	return (
		<aside className="sidebar">
			<button>Project X</button>
			<nav>
				<button onClick={() => setActivePage('dashboard')}>Dashboard</button>
				<button onClick={() => setActivePage('documents')}>Documents</button>
				<button onClick={() => setActivePage('projects')}>Projects</button>
				<button onClick={() => setActivePage('chat')}>Team Chat</button>
				<button onClick={() => setActivePage('files')}>File Library</button>
			</nav>
			<button className="settings" onClick={() => setActivePage('settings')}>Settings</button>
		</aside>
	);
}

export default Sidebar;