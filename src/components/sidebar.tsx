import './sidebar.css';

function Sidebar() {
	return (
		<aside className="sidebar">
			<button>Project X</button>
			<nav>
				<button>Dashboard</button>
				<button>Documents</button>
				<button>Projects</button>
				<button>Team Chat</button>
				<button>File Library</button>
			</nav>
			<button className="settings">Settings</button>
		</aside>
	);
}

export default Sidebar;