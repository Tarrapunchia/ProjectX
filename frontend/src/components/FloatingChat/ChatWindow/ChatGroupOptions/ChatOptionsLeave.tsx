import { type Group, type FloatingChatInfo, useWebSocket } from '../../../../utilities/WebSocketContext';
import { FiCheck, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import helper from '../../../../utilities/helpers';

interface ChatOptionsLeaveProps {
    openOption: 'add' | 'edit' | 'leave' | null;
    setOpenOption: (value: 'add' | 'edit' | 'leave' | null) => void;
    group?: Group;
    activeChat: FloatingChatInfo | null;
    setActiveChat: (chat: FloatingChatInfo | null) => void;
}

export const ChatOptionsLeave = ({openOption, setOpenOption, group, activeChat, setActiveChat}: ChatOptionsLeaveProps) => {
    const { t } = useTranslation();
    const { groups, setGroups, closeFloatingChat} = useWebSocket();

    return (
        <div className={`absolute origin-center h-full w-full bg-bg-color/90 transition-all duration-300 font-light
                        ${openOption === 'leave' ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}>
            <div className="flex border-b border-t border-overlay-border-color flex-col space-y-4 bg-bg-color h-40 w-full mt-40 items-center justify-center">
                <span className="text-xl">{t('chat_options_leave.leave_prompt')}</span>
                <div className="flex justify-between items-center gap-5">
                    <button
                        onClick={async () => {
                            await helper.deleter(`/api/v1/groups/${group?.id}/leave`);
                            const updatedGroups = groups.filter(g => g.id !== group?.id);
                            setGroups(updatedGroups);
                            if (activeChat)
                                closeFloatingChat(activeChat.roomId)
                            setActiveChat(null);
                            setOpenOption(null);
                        }}
                        className="flex border p-1 rounded-md w-30 h-10 items-center justify-center transition-all hover:scale-110 hover:border-owner-color hover:cursor-pointer"
                    >
                        <FiCheck size={24} className="mr-2"/>
                        <span>{t('chat_options_leave.confirm')}</span>
                    </button>
                    <button
                        onClick={() => setOpenOption(null)}
                        className="flex border p-1 rounded-md w-30 h-10 items-center justify-center transition-all hover:scale-110 hover:border-owner-color hover:cursor-pointer"
                    >
                        <FiX size={24} className="mr-2"/>
                        <span>{t('chat_options_leave.cancel')}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}