import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CONSTS from '../../data/consts';
import { Mail, Phone, Briefcase, User as UserIcon, MapPin, Ban } from 'lucide-react';
import { useWebSocket } from '../../utilities/WebSocketContext';
import UserProfileModal, { type ModalUser } from '../userProfilePageModal/userProfilePageModal';

const ProfilePage: React.FC = () => 
{
    const { t } = useTranslation();
    
    // Prendiamo TUTTO dal WebSocket Context. Niente più chiamate HTTP inutili qui.
    const { activeUser, friends, blockedUsers, loadBlockedUsers, loadFriends } = useWebSocket();

    const [selectedUser, setSelectedUser] = useState<ModalUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'friend' | 'blocked'>('friend');

    // Quando blocchi/sblocchi dal modale, diciamo al WS di ricaricare le sue liste globali
    const handleGlobalAndLocalRefresh = async () => 
    {
        if (loadBlockedUsers) await loadBlockedUsers();
        if (loadFriends) await loadFriends();
    };

    const handleAddFriend = (userId: number) => {
        console.log("Azione non necessaria qui:", userId);
    };

    const handleFriendClick = (friend: any) => {
        setSelectedUser(friend);
        setModalMode('friend');
        setIsModalOpen(true);
    };

    const handleBlockedClick = (user: any) => {
        setSelectedUser(user);
        setModalMode('blocked');
        setIsModalOpen(true);
    };

    // Finché il WS sta caricando l'utente attivo, mostriamo il loading
    if (!activeUser) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-main-bg-color text-zinc-400">
                {t("profile.loading")}
            </div>
        );
    }

    const fullAddress = [activeUser.address, activeUser.city, activeUser.state, activeUser.cap]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="flex flex-col h-full w-full p-6 bg-main-bg-color overflow-y-auto custom-scrollbar relative">
            <h1 className="text-2xl font-bold text-text-main mb-8 shrink-0">{t("profile.page_title")}</h1>

            {/* SEZIONE HEADER PROFILO UTENTE LOGGATO */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 shrink-0 items-start">
                <div className="shrink-0 mx-auto md:mx-0">
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center border-4 border-side-bg-color shadow-lg">
                        <img 
                            src={`${CONSTS.BE}/api/v1/users/${activeUser.id}/avatar?t=${new Date().getTime()}`} 
                            alt="Profile Picture" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex flex-col flex-1 text-center md:text-left mt-2">
                    <h2 className="text-3xl font-bold text-text-main mb-1">
                        {activeUser.name} {activeUser.surname}
                    </h2>
                    
                    <div className="flex items-center justify-center md:justify-start gap-2 text-owner-color mb-6">
                        <Briefcase size={16} />
                        <p className="text-sm font-medium">
                            {activeUser.jobQualifier || t("profile.no_role")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 max-w-2xl text-sm">
                        <div className="flex items-center gap-3">
                            <Mail className="text-zinc-500 shrink-0" size={18} />
                            <span className="text-text-main truncate">{activeUser.email || t("profile.not_available")}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="text-zinc-500 shrink-0" size={18} />
                            <span className="text-text-main truncate">{activeUser.phone || t("profile.not_available")}</span>
                        </div>

                        <div className="flex items-center gap-3 sm:col-span-2">
                            <MapPin className="text-zinc-500 shrink-0" size={18} />
                            <span className="text-text-main truncate">
                                {fullAddress || t("profile.no_address")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-overlay-border-color mb-8 shrink-0" />

            {/* SEZIONE AMICI */}
            <div className="flex flex-col shrink-0 mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <UserIcon className="text-text-main" size={20} />
                    <h2 className="text-xl font-bold text-text-main">{t("profile.friends_title")}</h2>
                    <span className="bg-side-bg-color border border-overlay-border-color text-zinc-400 text-xs px-2 py-0.5 rounded-full ml-2">
                        {friends?.length || 0}
                    </span>
                </div>

                {friends && friends.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {friends.map((friend) => (
                            <div 
                                key={friend.id}
                                onClick={() => handleFriendClick(friend)} 
                                className="flex items-center gap-3 p-2.5 bg-side-bg-color border border-overlay-border-color rounded-xl hover:border-text-main transition-colors shadow-sm group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-overlay-border-color bg-side-bg-color shrink-0 flex items-center justify-center">
                                    <img 
                                        src={`${CONSTS.BE}/api/v1/users/${friend?.id}/avatar`} 
                                        alt={`${friend?.name} avatar`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <span className="text-sm font-medium text-text-main truncate transition-colors">
                                    {friend.name + " " + friend.surname}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-side-bg-color border border-overlay-border-color border-dashed rounded-2xl text-zinc-500">
                        <UserIcon size={32} className="mb-2 opacity-50" />
                        <p>{t("profile.no_friends")}</p>
                    </div>
                )}
            </div>

            {/* SEZIONE BLOCCATI */}
            {blockedUsers && blockedUsers.length > 0 && (
                <div className="flex flex-col shrink-0">
                    <div className="flex items-center gap-2 mb-6">
                        <Ban className="text-red-500/80" size={20} />
                        <h2 className="text-xl font-bold text-red-500/80">{t("profile.blocked_title")}</h2>
                        <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-2 py-0.5 rounded-full ml-2">
                            {blockedUsers.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {blockedUsers.map((user) => (
                            <div 
                                key={user.id}
                                onClick={() => handleBlockedClick(user)} 
                                className="flex items-center gap-3 p-2.5 bg-side-bg-color/50 border border-red-500/20 rounded-xl hover:border-red-500/50 transition-colors shadow-sm group cursor-pointer opacity-70 hover:opacity-100"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-red-500/30 bg-side-bg-color shrink-0 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-300">
                                    <img 
                                        src={`${CONSTS.BE}/api/v1/users/${user?.id}/avatar`} 
                                        alt={`${user?.name} avatar`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-sm font-medium text-text-main/80 truncate transition-colors">
                                    {user.name + " " + user.surname}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL PROFILO UTENTE */}
            <UserProfileModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                isFriend={modalMode === 'friend'} 
                isBlockedByMe={modalMode === 'blocked'}
                onAddFriend={handleAddFriend} 
                onRefresh={handleGlobalAndLocalRefresh}
            />

        </div>
    );
};

export default ProfilePage;