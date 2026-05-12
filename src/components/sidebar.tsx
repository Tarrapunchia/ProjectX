import helpers from "../utilities/helpers";
import { useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    FileText, 
    CheckSquare, 
    MessageSquare, 
    Library, 
    Settings, 
    LogOut 
} from "lucide-react";

interface SidebarProps {
	className?: string;
    setActivePage: (page: string) => void;
}

function Sidebar({ setActivePage, className }: SidebarProps) {
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        await helpers.poster('/api/v1/users/logout', {});
        navigate('/');
    };

    // Classi base: justify-center di base (per l'icona), justify-start su schermi grandi
    const btnBase = "flex items-center justify-center lg:justify-start gap-3 !p-[10px] lg:!p-[10px_15px] text-text-main !border-none !bg-side-bg-color cursor-pointer !rounded-[10px] transition-all !outline-none w-full";
    const btnHover = "hover:!bg-category-bg-color hover:!font-medium group";
    const btnFocus = "focus:!bg-category-bg-color focus:!font-medium focus:!text-text-main";

    return (
        <aside className={`${className} w-full h-full bg-side-bg-color p-[5px_10px] lg:p-[5px_15px] border-r border-overlay-border-color flex flex-col overflow-hidden transition-all duration-300`}>
            
            {/* Logo: "X" su mobile, "PROJECT X" su desktop */}
			<div className="font-bold! text-[24px]! px-0 lg:px-4 mt-5 mb-20 text-text-main flex items-center justify-center lg:justify-start w-full tracking-tighter min-w-0 overflow-hidden">
				<span className="lg:hidden text-owner-color shrink-0">X</span>
				<span className="hidden lg:block truncate">PROJECT X</span>
			</div>

            {/* Main Navigation */}
			<nav className="flex flex-col gap-2">
				<button title="Dashboard" className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('dashboard')}>
					<LayoutDashboard size={20} className="shrink-0" />
					<span className="hidden lg:block truncate !text-[18px] !font-light">
						Dashboard
					</span>
				</button>

				<button title="Documents" className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('documents')}>
					<FileText size={20} className="shrink-0" />
					<span className="hidden lg:block truncate !text-[18px] !font-light">
						Documents
					</span>
				</button>

				<button title="Tasks" className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('tasks')}>
					<CheckSquare size={20} className="shrink-0" />
					<span className="hidden lg:block truncate !text-[18px] !font-light">
						Tasks
					</span>
				</button>

				<button title="Team Chat" className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('chat')}>
					<MessageSquare size={20} className="shrink-0" />
					<span className="hidden lg:block truncate !text-[18px] !font-light">
						Team Chat
					</span>
				</button>

				<button title="File Library" className={`${btnBase} ${btnHover} ${btnFocus}`} onClick={() => setActivePage('files')}>
					<Library size={20} className="shrink-0" />
					<span className="hidden lg:block truncate !text-[18px] !font-light">
						File Library
					</span>
				</button>
			</nav>

			<div className="mt-auto flex flex-col gap-2 mb-2 w-full min-w-0">
				<button 
					title="Settings"
					className={`${btnBase} ${btnHover} ${btnFocus}`} 
					onClick={() => setActivePage('settings')}
				>
					<Settings size={22} className="shrink-0" />
					<span className="hidden lg:block truncate !text-[18px] !font-light">Settings</span>
				</button>
				<button 
					title="Logout"
					className={`${btnBase} ${btnHover} ${btnFocus} text-red-500! hover:text-red-400!`} 
					onClick={handleLogout}
				>
					<LogOut size={22} className="shrink-0" />
					<span className="hidden lg:block truncate !text-[18px] !font-light">Logout</span>
				</button>
			</div>
        </aside>
    );
}

export default Sidebar;