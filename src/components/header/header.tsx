import type { ProjectInfo } from '../../data/types';
import { FiRepeat } from 'react-icons/fi';
import { useState } from 'react';
import CONSTS from '../../data/consts';
import SearchBar from './SearchBar';
import { ProfileMenu } from './profileMenu';
import { useWebSocket } from '../../utilities/WebSocketContext';

interface HeaderProps {
    className?: string;
    setActivePage: (page: string) => void;
    selectedProject: ProjectInfo | null;
}

function Header({ setActivePage, selectedProject, className }: HeaderProps) {
    const { activeUser } = useWebSocket();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const activeUserId = activeUser?.id || null;

    // Via MOCK_USER. Se non c'è l'utente mettiamo l'immagine grigia di base
    const avatarUrl = activeUser 
        ? `${CONSTS.BE}/api/v1/users/${activeUser.id}/avatar?t=${new Date().getTime()}`
        : '/placeholder-avatar.png';

    return (
        <header className={`${className} bg-side-bg-color text-white p-[15px_20px] flex items-center border-b border-overlay-border-color min-w-0`}>
            <span 
                onClick={() => setActivePage('projects')} 
                className="relative text-text-main inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-text-main cursor-pointer mr-3.75 ml-1.25 text-[20px] hover:bg-bg-color hover:scale-110 transition-transform duration-300 group
                after:content-['Change_Project'] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:mt-1.25
                after:bg-bg-color after:border after:border-text-main after:text-main after:py-1.25 after:px-2.5 after:rounded-sm after:text-[12px] after:white-space-nowrap
                after:opacity-0 after:invisible after:transition-opacity after:duration-300
                hover:after:opacity-100 hover:after:visible"
            >
                <FiRepeat />
            </span>
            <h1 className="flex-1 text-text-main min-w-0 truncate m-0 mr-12.5 text-[35px] font-bold leading-tight">
                {selectedProject ? selectedProject.name : 'Dashboard'}
            </h1>
            <SearchBar activeUserId={activeUserId}/>
            <div className="relative mr-2">
                <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center justify-center p-0! bg-transparent! border-none! cursor-pointer focus:outline-none! focus:border-none! active:border-none!"
                >
                    <img 
                        src={avatarUrl} 
                        alt="Foto profilo" 
                        className="w-12.5 h-12.5 rounded-full object-cover hover:scale-110 transition-transform duration-300 block"
                        onError={(e) => {
                            // Se per qualche motivo il backend dà errore 404 sull'immagine, carichiamo il placeholder
                            (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                        }}
                    />
                </button>
                { profileMenuOpen &&
                    <ProfileMenu
                        setActivePage={setActivePage}
                    /> 
                }
            </div>
        </header>
    );
}

export default Header;