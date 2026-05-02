interface SidebarProps {
	setActivePage: (page: string) => void;
}

function Sidebar({ setActivePage }: SidebarProps) {
	const btnBase = "!p-[10px_15px] text-text-main !border-none !bg-side-bg-color cursor-pointer text-left !rounded-[10px] !text-[20px] !font-light transition-colors !outline-none";
	const btnHover = "hover:!bg-category-bg-color hover:!font-medium";
	const btnFocus = "focus:!bg-category-bg-color focus:!font-medium focus:!text-text-main";

	return (
		<aside className="bg-side-bg-color p-[5px_20px] [grid-area:sidebar] border-r border-overlay-border-color flex flex-col h-full overflow-hidden">
			<button 
				className="bg-transparent! border-none! cursor-pointer font-medium! text-[35px]! text-center mt-2.5 outline-none! text-text-main block w-full"
			>
				Project X
			</button>
			<nav className="flex flex-col mt-10 gap-2.5">
				<button className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('dashboard')}>Dashboard</button>
				<button className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('documents')}>Documents</button>
				<button className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('tasks')}>Tasks</button>
				<button className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('chat')}>Team Chat</button>
				<button className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('files')}>File Library</button>
			</nav>
			<button 
				className={`${btnBase} ${btnHover} ${btnFocus} mt-auto mb-2.5`} 
				onClick={() => setActivePage('settings')}
			>
				Settings
			</button>
		</aside>
	);
}

export default Sidebar;