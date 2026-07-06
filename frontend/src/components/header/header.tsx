import { FiRepeat } from 'react-icons/fi';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from './SearchBar';
import { ProfileMenu } from './profileMenu';
import { useWebSocket, type ProjectDetailed } from '../../utilities/WebSocketContext';
import { Avatar } from '../Avatar';
import CONSTS from '../../data/consts';

interface HeaderProps {
    className?: string;
    setActivePage: (page: string) => void;
    selectedProject: ProjectDetailed | null;
}

function Header({ setActivePage, selectedProject, className }: HeaderProps) 
{
    const { t } = useTranslation();
    const { activeUser } = useWebSocket();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const avatarUrl = activeUser 
        ? `${CONSTS.BE}/api/v1/users/${activeUser.id}/avatar?t=${new Date().getTime()}`
        : '/placeholder-avatar.png';
    const activeUserId = activeUser?.id || null;

    return (
        <header className={`${className} bg-side-bg-color text-white p-[15px_20px] flex items-center border-b border-overlay-border-color min-w-0`}>
            <span 
                onClick={() => setActivePage('projects')}
                data-label={t('header.change_project')}
                className="relative text-text-main inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-text-main cursor-pointer mr-3.75 ml-1.25 text-[20px] hover:bg-bg-color hover:scale-110 transition-transform duration-300 group
                after:content-[attr(data-label)] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:mt-1.25
                after:bg-bg-color after:border after:border-text-main after:text-main after:py-1.25 after:px-2.5 after:rounded-sm after:text-[12px] after:whitespace-nowrap
                after:opacity-0 after:invisible after:transition-opacity after:duration-300
                hover:after:opacity-100 hover:after:visible"
            >
                <FiRepeat />
            </span>
            <h1 className="flex-1 text-text-main min-w-0 truncate m-0 mr-12.5 text-[35px] font-bold leading-tight">
                {selectedProject ? selectedProject.name : t('header.dashboard')}
            </h1>
            <SearchBar activeUserId={activeUserId}/>
            <div className="relative mr-2">
                <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center justify-center p-0! bg-transparent! border-none! cursor-pointer focus:outline-none! focus:border-none! active:border-none!">
                    <Avatar
                        src={avatarUrl}
                        alt={t('header.profile_alt')}
                        className="w-12.5 h-12.5 rounded-full object-cover hover:scale-110 transition-transform duration-300 block"
                    />
                </button>
                { profileMenuOpen &&
                    <ProfileMenu
                        setActivePage={setActivePage}
						setProfileMenuOpen={setProfileMenuOpen}
                    /> 
                }
            </div>
        </header>
    );
}

export default Header;