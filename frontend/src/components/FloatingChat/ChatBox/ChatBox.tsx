import { memo } from 'react';
import { menuSize } from '../ChatMenu/ChatMenu';
import { buttonSize } from '../ChatButton';
import { useWebSocket, type FloatingChatInfo } from '../../../utilities/WebSocketContext';
import { ChatBoxPrivate } from './ChatBoxPrivate';
import { ChatBoxGroup } from './ChatBoxGroup';

interface ChatBoxProps {
	isOpen: boolean;
	isDragging: boolean;
	hiddenChatId: string | null;
	pos: number;
	friends: any[];
	groups: any[];
	activeChat: FloatingChatInfo | null;
	setActiveChat: (chat: FloatingChatInfo | null) => void;
	onAvatarDragStart: (chat: FloatingChatInfo, clientX: number, clientY: number) => void;
}

export const ChatBox = memo(({ isOpen, isDragging, hiddenChatId, pos, friends, groups, activeChat, setActiveChat, onAvatarDragStart }: ChatBoxProps) => 
{
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
			{floatingChats.map((chat) => (
				chat.type === 'private' ? (
					<ChatBoxPrivate
						key={chat.roomId}
						friends={friends}
						chat={chat}
						activeChat={activeChat}
						setActiveChat={setActiveChat}
						hiddenChatId={hiddenChatId}
						onAvatarDragStart={onAvatarDragStart}
					/>
				) : (
					<ChatBoxGroup
						key={chat.roomId}
						groups={groups}
						chat={chat}
						activeChat={activeChat}
						hiddenChatId={hiddenChatId}
						setActiveChat={setActiveChat}
						onAvatarDragStart={onAvatarDragStart}
					/>
				)
			))}
		</div>
	)
});