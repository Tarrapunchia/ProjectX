import { type Group, type FloatingChatInfo } from '../../../utilities/WebSocketContext';

interface ChatBoxGroupProps {
	groups: Group[];
	chat: FloatingChatInfo;
	activeChat: FloatingChatInfo | null;
	hiddenChatId: string | null;
	setActiveChat: (chat: FloatingChatInfo | null) => void;
	onAvatarDragStart: (chat: FloatingChatInfo, clientX: number, clientY: number) => void;
}

export const ChatBoxGroup = ({ groups, chat, activeChat, hiddenChatId, setActiveChat, onAvatarDragStart }: ChatBoxGroupProps) => {
	const group = groups.find(g => g.id === chat.roomId);
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
			className={`relative w-12 h-12 m-1 rounded-md border-2 transition-all hover:scale-110 shrink-0
						${isActive ? 'border-owner-color text-owner-color scale-110' : 'border-overlay-border-color'}`}
		>
			<div className="w-full h-full rounded-md bg-side-bg-color flex items-center justify-center overflow-hidden text-lg uppercase">
				<span>{group?.name.charAt(0)}</span>
			</div>
		</button>
	)
}