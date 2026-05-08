import { memo } from 'react';
import { menuSize } from './ChatMenu';
import { buttonSize } from './ChatButton';
import { useWebSocket, type FloatingChatInfo } from '../../utilities/WebSocketContext';

interface ChatBoxProps {
	isOpen: boolean;
	isDragging: boolean;
	hiddenChatId: string | null;
	pos: number;
	friends: any[];
	activeChat: FloatingChatInfo | null;
	setActiveChat: (chat: FloatingChatInfo | null) => void;
	onAvatarDragStart: (chat: FloatingChatInfo, clientX: number, clientY: number) => void;
}

export const ChatBox = memo(({ isOpen, isDragging, hiddenChatId, pos, friends, activeChat, setActiveChat, onAvatarDragStart }: ChatBoxProps) => {
	const { floatingChats } = useWebSocket();
	
	const openDown = pos - (menuSize.y + 20) < 0;

	const origins = {
		'top': 'origin-top',
		'bottom': 'origin-bottom',
	};
	const originKey = `${openDown ? 'top' : 'bottom'}` as keyof typeof origins;

	const positionStyle = openDown
		? { top: `${buttonSize + 4}px` }
		: { bottom: `${buttonSize + 4}px`};

	return (
		<div 
		onMouseDown={(e) => e.stopPropagation()}
		style= {{
			height: `${menuSize.y - buttonSize - 4}px`,
			...positionStyle
		}}
		className={`absolute w-full overflow-y-auto no-scrollbar transition-all duration-400
					${origins[originKey]}
					${isOpen && !isDragging ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
		>
			{floatingChats.map((chat) => {
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
							if (activeChat === chat)
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
						<div className="w-full h-full rounded-full bg-side-bg-color flex items-center justify-center overflow-hidden text-lg">
							{friend?.avatarUrl && friend.avatarUrl !== '/avatar/default.png' ? (
								<img src={friend.avatarUrl} className="w-full h-full object-cover" />
							) : (
								<span>{friend?.name.charAt(0)}{friend?.surname.charAt(0)}</span>
							)}
						</div>
					</button>
				)
			})}
		</div>
	)
});