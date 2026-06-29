import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail, Phone, Briefcase, MapPin, UserPlus, Ban, Unlock, Loader2 } from 'lucide-react';
import CONSTS from '../../data/consts';
import helpers from "../../utilities/helpers";

export interface ModalUser {
    id: number;
    name: string;
    surname: string;
    jobQualifier?: string;
    email?: string;
    phone?: string;
    city?: string;
    address?: string;
    cap?: string;
    state?: string;
}

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: ModalUser | null;
    isFriend: boolean;
    isBlockedByMe?: boolean;
    onAddFriend: (userId: number) => void;
    onRefresh?: () => void | Promise<void>;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
    isOpen, 
    onClose, 
    user, 
    isFriend, 
    isBlockedByMe = false,
    onAddFriend,
    onRefresh
}) => {
    const { t } = useTranslation();
    const [isActionLoading, setIsActionLoading] = useState(false);

    if (!isOpen || !user) return null;

    const fullAddress = isFriend 
        ? [user.address, user.city, user.state, user.cap].filter(Boolean).join(", ") 
        : "";

    const hasValidString = (str?: string) => str && str.trim().length > 0;

    const handleBlockUser = async () => {
        if (!user) return;
        
        try {
            setIsActionLoading(true);
            const res = await helpers.poster('/api/v1/friends/block', { targetUserId: user.id });

            if (!res.success) {
                throw new Error(res.data?.error || 'Failed to block user');
            }

            console.log("Utente bloccato con successo:", res.data);
            onClose();
            if (onRefresh) onRefresh();
            
        } catch (error) {
            console.error("Errore durante il blocco dell'utente:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUnblockUser = async () => {
        if (!user) return;
        
        try {
            setIsActionLoading(true);
            const res = await helpers.poster('/api/v1/friends/unblock', { targetUserId: user.id });

            if (!res.success) {
                throw new Error(res.data?.error || 'Failed to unblock user');
            }

            console.log("Utente sbloccato con successo:", res.data);
            onClose();
            if (onRefresh) onRefresh();
            
        } catch (error) {
            console.error("Errore durante lo sblocco dell'utente:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-6" 
            onClick={onClose}
        >
            <div 
                className="bg-side-bg-color border border-overlay-border-color rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative shrink-0" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    disabled={isActionLoading}
                    className="absolute top-5 right-5 p-1.5 text-text-main rounded-full hover:scale-105 hover:border hover:border-text-main cursor-pointer disabled:opacity-50"
                >
                    <X size={22} />
                </button>

                <div className="p-10 flex flex-col items-center">
                    
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border border-overlay-border-color shadow-sm overflow-hidden bg-side-bg-color flex items-center justify-center mb-5 shrink-0">
                        <img 
                            src={`${CONSTS.BE}/api/v1/users/${user.id}/avatar`} 
                            alt={`${user.name} avatar`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                            }}
                        />
                    </div>

                    <div className="text-center mb-8 w-full">
                        <h2 className="text-3xl font-bold text-text-main mb-1.5">
                            {user.name} {user.surname}
                        </h2>
                        {hasValidString(user.jobQualifier) && (
                            <div className="flex items-center justify-center gap-2 text-owner-color">
                                <Briefcase size={15} />
                                <p className="text-sm font-medium">
                                    {user.jobQualifier}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* CONDIZIONE 1: L'UTENTE È BLOCCATO DA ME */}
                    {isBlockedByMe ? (
                        <div className="w-full flex flex-col items-center mt-2 text-center max-w-sm">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 w-full text-red-400">
                                <Ban size={24} className="mx-auto mb-2 opacity-80" />
                                <p className="text-sm font-medium">{t("user_profile_modal.blocked_title")}</p>
                                <p className="text-xs mt-1 opacity-70">{t("user_profile_modal.blocked_subtitle")}</p>
                            </div>
                            <button
                                onClick={handleUnblockUser}
                                disabled={isActionLoading}
                                className="flex items-center justify-center w-full gap-2 bg-text-main text-side-bg-color px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow-sm text-sm font-bold cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                {isActionLoading ? <Loader2 size={19} className="animate-spin" /> : <Unlock size={19} />}
                                {t("user_profile_modal.btn_unblock")}
                            </button>
                        </div>
                    ) : 
                    
                    /* CONDIZIONE 2: L'UTENTE È MIO AMICO */
                    isFriend ? (
                        <div className="w-full flex flex-col gap-y-4 text-sm text-text-main bg-bg-color p-8 rounded-2xl border border-overlay-border-color shadow-inner">
                            
                            {hasValidString(user.email) && (
                                <div className="flex items-center gap-4">
                                    <Mail className="text-zinc-500 shrink-0" size={18} />
                                    <span className="truncate">{user.email}</span>
                                </div>
                            )}

                            {hasValidString(user.phone) && (
                                <div className="flex items-center gap-4">
                                    <Phone className="text-zinc-500 shrink-0" size={18} />
                                    <span className="truncate">{user.phone}</span>
                                </div>
                            )}

                            {hasValidString(fullAddress) && (
                                <div className="flex items-center gap-4">
                                    <MapPin className="text-zinc-500 shrink-0" size={18} />
                                    <span className="truncate w-full">{fullAddress}</span>
                                </div>
                            )}

                            {!hasValidString(user.email) && !hasValidString(user.phone) && !hasValidString(fullAddress) && (
                                <p className="text-zinc-500 text-center italic w-full">
                                    {t("user_profile_modal.no_contact_info")}
                                </p>
                            )}
                            
                            {/* BOTTONE BLOCCO (Visibile solo per gli amici) */}
                            <div className="mt-4 flex justify-center w-full">
                                <button
                                    onClick={handleBlockUser}
                                    disabled={isActionLoading}
                                    className="flex items-center justify-center w-full gap-2 bg-red-500/30 text-white border border-red-500/20 px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm text-sm font-bold cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isActionLoading ? <Loader2 size={19} className="animate-spin" /> : <Ban size={19} />}
                                    {t("user_profile_modal.btn_block")}
                                </button>
                            </div>

                        </div>
                    ) : 
                    
                    /* CONDIZIONE 3: L'UTENTE NON È NÉ MIO AMICO NÉ BLOCCATO */
                    (
                        <div className="w-full flex flex-col items-center mt-2 text-center max-w-sm">
                            <p className="text-base text-zinc-400 mb-8 leading-relaxed">
                                {t("user_profile_modal.not_friends_msg", { name: user.name })} <br/>
                                {t("user_profile_modal.not_friends_sub")}
                            </p>
                            
                            <button
                                onClick={() => {
                                    onAddFriend(user.id);
                                    onClose();
                                }}
                                disabled={isActionLoading}
                                className="flex items-center justify-center w-full gap-2 bg-owner-color text-white px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg text-sm font-bold cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                <UserPlus size={19} />
                                {t("user_profile_modal.btn_send_request")}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;