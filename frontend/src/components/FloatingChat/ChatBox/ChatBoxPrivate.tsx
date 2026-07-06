import { type FloatingChatInfo } from '../../../utilities/WebSocketContext';

interface ChatBoxPrivateProps {
	friends: any[];
	chat: FloatingChatInfo;
	activeChat: FloatingChatInfo | null;
	hiddenChatId: string | null;
	setActiveChat: (chat: FloatingChatInfo | null) => void;
	onAvatarDragStart: (chat: FloatingChatInfo, clientX: number, clientY: number) => void;
}

export const ChatBoxPrivate = ({ friends, chat, activeChat, hiddenChatId, setActiveChat, onAvatarDragStart }: ChatBoxPrivateProps) => {
	const friend = friends.find(f => f.email === chat.senderMail);
	const isActive = activeChat?.roomId === chat.roomId;

	return (
		<button
			key={chat.roomId}
			onMouseDown={(e) => {
				e.stopPropagation();
				onAvatarDragStart(chat, e.clientX, e.clientY);
			}}
			onClick={() => {
				if (activeChat?.roomId === chat.roomId)
					setActiveChat(null)
				else
					setActiveChat(chat)
			}}
			style= {{
				opacity: hiddenChatId === chat.roomId ? 0 : 1
			}}
			className={`relative w-12 h-12 m-1 rounded-full border-2 transition-all hover:scale-110 shrink-0
						${isActive ? 'border-owner-color text-owner-color scale-110' : 'border-overlay-border-color'}`}
		>
			<div className="w-full h-full rounded-full bg-side-bg-color flex items-center justify-center overflow-hidden text-lg uppercase">
				<span>{friend?.name.charAt(0)}{friend?.surname.charAt(0)}</span>
			</div>
		</button>
	)
}