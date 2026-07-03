import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiFolder, FiLoader } from 'react-icons/fi';
import helpers from '../../utilities/helpers';
import { useWebSocket } from "../../utilities/WebSocketContext";
import CONSTS from '../../data/consts';
import UserProfileModal, { type ModalUser } from '../../pages/userProfilePageModal/userProfilePageModal';

interface SearchBarProps {
    activeUserId: string | number | null;
}

const SearchBar: React.FC<SearchBarProps> = ({ activeUserId }) => 
{
    const { t } = useTranslation();
    const [selectedUser, setSelectedUser] = useState<ModalUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ users: any[], projects: any[] }>({ users: [], projects: [] });
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Importiamo loadBlockedUsers dal context per forzare l'aggiornamento
    const { friends, blockedUsers, loadBlockedUsers } = useWebSocket();
    
    const searchWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => 
    {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sendFriendRequest = async (targetUserId: number) =>
    {
        try {
            await helpers.poster('/api/v1/friends/requests', { targetUserId });
        } catch (err) {
            console.error("Errore nell'invio dell'amicizia:", err);
        }
    };

    useEffect(() => 
    {
        if (!activeUserId) return;
        const timeoutId = setTimeout(() => {
            if (query.length > 0) {
                performSearch(query);
            } else {
                setResults({ users: [], projects: [] });
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, activeUserId]);

    const performSearch = async (searchTerm: string) => 
    {
        if (!searchTerm.trim()) {
            setResults({ users: [], projects: [] });
            return;
        }

        setLoading(true);
        setShowDropdown(true);

        try {
            const [usersRes, projectsRes] = await Promise.all([
                helpers.getter(`/api/v1/users/search?username=${searchTerm}`, null),
                helpers.getter(`/api/v1/users/activeUsersProjects`, null)
            ]);

            const allUsers = usersRes.data || [];
            // Filtriamo solo te stesso. I bloccati li filtriamo "in tempo reale" nel render
            const filteredUsers = allUsers.filter((user: any) => user.id !== activeUserId);

            const allProjectsData = projectsRes.data || [];
            const filteredProjects = allProjectsData
                .map((item: any) => item.project)
                .filter((proj: any) => 
                    proj.name.toLowerCase().startsWith(searchTerm.toLowerCase())
                );

            setResults({
                users: filteredUsers,
                projects: filteredProjects
            });

        } catch (error) {
            console.error("Errore durante la ricerca:", error);
            setResults({ users: [], projects: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = async (targetUser: any) => {
        try {
            // Prendiamo il profilo completo al volo (così vedi telefono, residenza ecc.)
            const res = await helpers.getter(`/api/v1/users/${targetUser.id}/profile`, null);
            if (res && res.success) {
                setSelectedUser(res.data);
            } else {
                setSelectedUser(targetUser);
            }
        } catch (error) {
            console.error("Errore nel recupero del profilo completo:", error);
            setSelectedUser(targetUser);
        } finally {
            setIsModalOpen(true);
            setShowDropdown(false);
        }
    };

    // Rendiamo la lista utenti reattiva ai blocchi in tempo reale
    const visibleUsers = results.users.filter(user => !blockedUsers.some((b: any) => b.id === user.id));

    return (
        <div ref={searchWrapperRef} className="relative max-w-50 md:max-w-75 mr-12">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                {loading ? <FiLoader className="animate-spin" size={18} /> : <FiSearch size={18} />}
            </span>
            
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value.length > 0) setShowDropdown(true);
                }}
                onFocus={() => {
                    if (query.length > 0) setShowDropdown(true);
                }}
                placeholder={t("searchbar.placeholder")}
                className="w-[50%] pl-10 pr-4 py-2 bg-bg-color border border-overlay-border-color rounded-full text-sm text-text-main 
                placeholder-slate-500 focus:outline-none focus:border-border-focus focus:w-full transition-all duration-200"
            />

            {showDropdown && query.length > 0 && 
            (
                <div className="absolute top-full mt-2 w-full bg-bg-color border border-overlay-border-color rounded-xl shadow-lg z-40 max-h-80 overflow-y-auto p-2 no-scrollbar">
                    
                    {/* Sezione Utenti */}
                    <div className="mb-2">
                        <h3 className="text-xs font-semibold text-slate-500 px-3 py-1 uppercase">{t("searchbar.users_title")}</h3>
                        {visibleUsers.length > 0 ? visibleUsers.map((user: any) => {
                            const isAlreadyFriend = friends.some((f: any) => f.id === user.id);
                            
                            return (
                                <div 
                                    key={user.id} 
                                    onClick={() => handleUserClick(user)}
                                    className="flex items-center justify-between gap-3 p-2 hover:bg-overlay-hover rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-side-bg-color overflow-hidden shrink-0 border border-overlay-border-color">
                                            <img 
                                                src={`${CONSTS.BE}/api/v1/users/${user.id}/avatar`} 
                                                alt={`${user.name} avatar`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-sm text-text-main">
                                            {user.name} {user.surname}
                                        </span>
                                    </div>
                                    
                                    {isAlreadyFriend && (
                                        <span className="text-[10px] text-green-500 font-semibold px-2">
                                            {t("searchbar.friend_badge")}
                                        </span>
                                    )}
                                </div>
                            );
                        }) : <p className="text-xs text-text-main px-3">{t("searchbar.no_users")}</p>}
                    </div>

                    <hr className="border-overlay-border-color my-2" />

                    {/* Sezione Progetti */}
                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 px-3 py-1 uppercase">{t("searchbar.projects_title")}</h3>
                        {results.projects.length > 0 ? results.projects.map((project: any) => (
                            <div key={project.id} className="flex items-center gap-3 p-2 hover:bg-overlay-hover rounded-lg cursor-pointer transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-blue-900/30 text-blue-400 flex items-center justify-center">
                                    <FiFolder />
                                </div>
                                <span className="text-sm text-text-main">{project.name}</span>
                            </div>
                        )) : <p className="text-xs text-text-main px-3">{t("searchbar.no_projects")}</p>}
                    </div>
                </div>
            )}

            {/* MODAL PROFILO UTENTE */}
            <UserProfileModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                isFriend={selectedUser ? friends.some((f: any) => f.id === selectedUser.id) : false}
                isBlockedByMe={selectedUser ? blockedUsers.some((b: any) => b.id === selectedUser.id) : false}
                onAddFriend={sendFriendRequest}
                onRefresh={loadBlockedUsers}
            />
        </div>
    );
};

export default SearchBar;