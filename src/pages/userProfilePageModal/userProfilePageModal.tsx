import React, { useState } from 'react';
import { X, Mail, Phone, Briefcase, MapPin, UserPlus, Ban, Loader2 } from 'lucide-react';
import CONSTS from '../../data/consts';

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
    onAddFriend: (userId: number) => void;
    // onBlockUser RIMOSSO: gestiamo tutto qui dentro
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
    isOpen, 
    onClose, 
    user, 
    isFriend, 
    onAddFriend 
}) => {
    // Stato per gestire il caricamento durante la chiamata API
    const [isBlocking, setIsBlocking] = useState(false);

    if (!isOpen || !user) return null;

    const fullAddress = isFriend 
        ? [user.address, user.city, user.state, user.cap].filter(Boolean).join(", ") 
        : "";

    const hasValidString = (str?: string) => str && str.trim().length > 0;

    // --- FUNZIONE PER BLOCCARE L'UTENTE ---
    const handleBlockUser = async () => {
        if (!user) return;
        
        try {
            setIsBlocking(true);

            // Sostituisci il path con quello esatto del tuo router se diverso (es. /api/v1/friends/block)
            const response = await fetch(`${CONSTS.BE}/api/v1/friends/block`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": 'application/json',
                    // Aggiungi qui l'header di autorizzazione se non usi i cookie/sessioni automatiche
                    // 'Authorization': `Bearer ${tuoToken}`
                },
                credentials: 'include',
                body: JSON.stringify({ targetUserId: user.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to block user');
            }

            // Blocco avvenuto con successo
            console.log("Utente bloccato con successo:", data);
            
            // Chiudiamo il modale
            onClose();
            
            // NOTA: Qui potresti voler scatenare un evento globale o fare un refresh 
            // per aggiornare la lista amici nel componente padre.
            
        } catch (error) {
            console.error("Errore durante il blocco dell'utente:", error);
            // Qui potresti inserire un toast o un alert per notificare l'errore all'utente
        } finally {
            setIsBlocking(false);
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
                    disabled={isBlocking}
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

                    {isFriend ? (
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
                                    No contact information provided.
                                </p>
                            )}
                            
                            {/* BOTTONE BLOCCO CON STATO DI CARICAMENTO */}
                            <div className="mt-4 flex justify-center w-full">
                                <button
                                    onClick={handleBlockUser}
                                    disabled={isBlocking}
                                    className="flex items-center justify-center w-full gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm text-sm font-bold cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isBlocking ? (
                                        <>
                                            <Loader2 size={19} className="animate-spin" />
                                            Blocking...
                                        </>
                                    ) : (
                                        <>
                                            <Ban size={19} />
                                            Block User
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center mt-2 text-center max-w-sm">
                            <p className="text-base text-zinc-400 mb-8 leading-relaxed">
                                You are not friends with <span className="text-text-main font-medium">{user.name}</span>. <br/>
                                Send a request to see their full contact details!
                            </p>
                            <button
                                onClick={() => {
                                    onAddFriend(user.id);
                                    onClose();
                                }}
                                className="flex items-center gap-2 bg-owner-color text-white px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow-lg text-sm font-bold cursor-pointer active:scale-95"
                            >
                                <UserPlus size={19} />
                                Send Friend Request
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;