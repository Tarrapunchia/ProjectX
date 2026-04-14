// import './sidebar.css';

// interface SidebarProps {
// 	setActivePage: (page: string) => void;
// }

// function Sidebar({ setActivePage }: SidebarProps) {
// 	return (
// 		<aside className="sidebar">
// 			<button className="logo">Project X</button>
// 			<nav>
// 				<button onClick={() => setActivePage('dashboard')}>Dashboard</button>
// 				<button onClick={() => setActivePage('documents')}>Documents</button>
// 				<button onClick={() => setActivePage('tasks')}>Tasks</button>
// 				<button onClick={() => setActivePage('chat')}>Team Chat</button>
// 				<button onClick={() => setActivePage('files')}>File Library</button>
// 			</nav>
// 			<button className="settings" onClick={() => setActivePage('settings')}>Settings</button>
// 		</aside>
// 	);
// }

// export default Sidebar;

interface SidebarProps {
	setActivePage: (page: string) => void;
}

function Sidebar({ setActivePage }: SidebarProps) {
	const btnBase = "!p-[10px_15px] !border-none !bg-[#333] cursor-pointer text-left !rounded-[10px] !text-[#dddcdc] !text-[20px] !font-light transition-colors !outline-none";
	const btnHover = "hover:!bg-[#3e3e3e] hover:!font-medium";
	const btnFocus = "focus:!bg-[#3e3e3e] focus:!font-medium focus:!text-white";

	return (
		<aside className="bg-[#333] p-[5px_20px] [grid-area:sidebar] border-r border-[#606060] flex flex-col h-full overflow-hidden">
			<button 
				className="!bg-transparent !border-none cursor-pointer !font-medium !text-[35px] text-center mt-[10px] !outline-none text-white block w-full"
			>
				Project X
			</button>
			<nav className="flex flex-col mt-[40px] gap-[10px]">
				<button className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('dashboard')}>Dashboard</button>
				<button className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('documents')}>Documents</button>
				<button className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('tasks')}>Tasks</button>
				<button className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('chat')}>Team Chat</button>
				<button className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('files')}>File Library</button>
			</nav>
			<button 
				className={`${btnBase} ${btnHover} ${btnFocus} mt-auto mb-[10px]`} 
				onClick={() => setActivePage('settings')}
			>
				Settings
			</button>
		</aside>
	);
}

export default Sidebar;