import { useState } from 'react'
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import { CreateOrganization } from './createOrganization';
import { FiPlusCircle, FiX } from 'react-icons/fi';
import { useWebSocket } from '../../utilities/WebSocketContext'

interface ProfileMenuProps {
    setActivePage: (page: string) => void;
}

export const ProfileMenu = ({ setActivePage }: ProfileMenuProps) => {
    const { t } = useTranslation();
    const { activeUser, organizations, activeOrg, setActiveOrg } = useWebSocket();
    const [ createOpen, setCreateOpen ] = useState(false);

    return (
        <div className="absolute w-80 h-80 z-50 right-0 top-14 no-scrollbar bg-side-bg-color border border-owner-color rounded-md text-text-main ">
            <div className="flex items-center flex-col w-full h-full mt-2 gap-4">
                <div className="flex w-full items-center justify-between pr-2 pl-4">
                    <div className="max-w-[70%]">
                        <div className="text-lg line-clamp-1">
                            {activeUser?.name} {activeUser?.surname}
                        </div>
                        {activeOrg && (
                            <div className="flex items-center font-light gap-1">
                                <button
                                    onClick={() => setActiveOrg(null)}
                                    className="flex items-center justify-center border rounded-full w-4 h-4 transition-all duration-300 hover:text-red-500 hover:scale-110 active:scale-90"
                                >
                                    <FiX strokeWidth={1.5} />
                                </button>
                                <div className="line-clamp-1">
                                    {activeOrg.name}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-20">
                        <ThemeToggle />
                    </div>
                </div>
                <button
                    onClick={() => setActivePage('profile')}
                    className="w-[90%] bg-category-bg-color border rounded-md border-overlay-border-color p-2 hover:cursor-pointer hover:border-owner-color hover:scale-105 transition-all duration-300 active:scale-95"
                >
                    {t('profile_menu.view_profile')}
                </button>
                <div className="flex flex-col bg-category-bg-color w-[90%] h-[55%] border rounded-md border-overlay-border-color">
                    <button 
                        onClick={ () => setCreateOpen(true) }
                        className="flex p-2 gap-2 items-center justify-center border-b border-overlay-border-color hover:text-owner-color hover:cursor-pointer"
                    >
                        <FiPlusCircle size={24}/>
                        <span>
                            {t('profile_menu.add_organization')}
                        </span>
                    </button>
                    <div className="flex flex-col overflow-y-auto no-scrollbar text-xl">
                        {organizations
                             .filter(o => o.ownerId === activeUser?.id)
                             .map(o => (
                                <button
                                    key={o.id}
                                    onClick={() => setActiveOrg(o)}
                                    className="flex border border-overlay-border-color/50 w-full transition-all duration-300 hover:border-owner-color hover:rounded-xs hover:text-owner-color">
                                    <span className="pl-1 py-1">
                                        {o.name}
                                    </span>
                                </button>
                             ))
                        }
                    </div>
                </div>
            </div>
            {createOpen && (
                <CreateOrganization
                    setCreateOpen={setCreateOpen}
                    activeUser={activeUser}
                />
            )}
        </div>
    )
}