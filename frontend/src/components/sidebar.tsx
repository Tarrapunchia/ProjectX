import { useWebSocket } from "../utilities/WebSocketContext";
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

interface SidebarProps 
{
	className?: string;
	activePage: string;
    setActivePage: (page: string) => void;
}

function Sidebar({ activePage, setActivePage, className }: SidebarProps) 
{
    const navigate = useNavigate();
	const { pendingRequests } = useWebSocket(); 
    
    const pendingCount = pendingRequests.length;
    const hasPending = pendingCount > 0;

    const handleLogout = async () => {
        await helpers.poster('/api/v1/users/logout', {});
        navigate('/');
    };

const btnBase = "flex items-center justify-center lg:justify-start gap-3 !p-[10px] lg:!p-[10px_15px] text-text-main !border-none cursor-pointer !rounded-[10px] transition-all !outline-none w-full";
    const btnHover = "hover:!bg-category-bg-color hover:!font-medium group";

    const getBtnClass = (pageName: string) => 
    {
        const isActive = activePage === pageName;
        return `${btnBase} ${btnHover} ${isActive ? '!bg-category-bg-color !font-medium' : '!bg-side-bg-color'}`;
    };

	const getIconColor = (pageName: string) => 
	{
        return activePage === pageName ? "text-owner-color" : "text-inherit";
    };

    return (
        <aside className={`${className} w-full h-full bg-side-bg-color p-[5px_10px] lg:p-[5px_15px] border-r border-overlay-border-color flex flex-col overflow-hidden transition-all duration-300`}>
            
            <div className="font-bold! text-[24px]! px-0 lg:px-4 mt-5 mb-20 text-text-main flex items-center justify-center lg:justify-start w-full tracking-tighter min-w-0 overflow-hidden">
                <span className="lg:hidden text-owner-color shrink-0">X</span>
                <span className="hidden lg:block truncate">PROJECT X</span>
            </div>

            <nav className="flex flex-col gap-2">
                <button title="Dashboard" className={`${getBtnClass('dashboard')} relative`} onClick={() => setActivePage('dashboard')}>
                    <div className="relative flex items-center justify-center">
                        <LayoutDashboard size={20} className={`shrink-0 transition-colors ${getIconColor('dashboard')}`} />
						{hasPending && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full border-2 border-side-bg-color">
                                {pendingCount > 9 ? '9+' : pendingCount}
                            </span>
                        )}
                    </div>
                    <span className="hidden lg:block truncate !text-[18px] !font-light">
                        Dashboard
                    </span>
                </button>

                <button title="Documents" className={`${getBtnClass('documents')} relative`} onClick={() => setActivePage('documents')}>
                    <FileText size={20} className={`shrink-0 transition-colors ${getIconColor('documents')}`} />
                    <span className="hidden lg:block truncate !text-[18px] !font-light">
                        Documents
                    </span>
                </button>

                <button title="Tasks" className={`${getBtnClass('tasks')} relative`} onClick={() => setActivePage('tasks')}>
                    <CheckSquare size={20} className={`shrink-0 transition-colors ${getIconColor('tasks')}`} />
                    <span className="hidden lg:block truncate !text-[18px] !font-light">
                        Tasks
                    </span>
                </button>

                <button title="Team Chat" className={`${getBtnClass('chat')} relative`} onClick={() => setActivePage('chat')}>
                    <MessageSquare size={20} className={`shrink-0 transition-colors ${getIconColor('chat')}`} />
                    <span className="hidden lg:block truncate !text-[18px] !font-light">
                        Team Chat
                    </span>
                </button>

                <button title="File Library" className={`${getBtnClass('files')} relative`} onClick={() => setActivePage('files')}>
                    <Library size={20} className={`shrink-0 transition-colors ${getIconColor('files')}`} />
                    <span className="hidden lg:block truncate !text-[18px] !font-light">
                        File Library
                    </span>
                </button>
            </nav>

            <div className="mt-auto flex flex-col gap-2 mb-2 w-full min-w-0">
                <button 
                    title="Settings"
                    className={`${getBtnClass('settings')} relative`} onClick={() => setActivePage('settings')}>
                    <Settings size={22} className={`shrink-0 transition-colors ${getIconColor('settings')}`} />
                    <span className="hidden lg:block truncate !text-[18px] !font-light">Settings</span>
                </button>
                <button 
                    title="Logout"
                    className={`${btnBase} ${btnHover} text-red-500! hover:text-red-400!`} 
                    onClick={handleLogout}>
                    <LogOut size={22} className="shrink-0" />
                    <span className="hidden lg:block truncate !text-[18px] !font-light">Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;