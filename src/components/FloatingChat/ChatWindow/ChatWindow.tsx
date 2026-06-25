import { useEffect, useRef } from 'react';
import { useWebSocket, type FloatingChatInfo, type Friend, type Group } from '../../../utilities/WebSocketContext';
import { menuSize, getFloatingLayout } from '../ChatMenu/ChatMenu';
import { ChatWindowPrivate } from './ChatWindowPrivate';
import { ChatWindowGroup } from './ChatWindowGroup';

interface ChatWindowProps {
	isOpen: boolean;
	isDragging: boolean;
	pos: { x: number, y: number };
	activeChat: FloatingChatInfo | null;
	friends: Friend[];
	groups: Group[];
	setActiveChat: (chat: FloatingChatInfo | null) => void;
}

export const ChatWindow = ({ isOpen, isDragging, pos, activeChat, friends, groups, setActiveChat }: ChatWindowProps) => {
	const { messages, loadHistory } = useWebSocket();
	const { horizontalClass, verticalClass, originKey } = getFloatingLayout(pos, menuSize);
	const scrollRef = useRef<HTMLDivElement>(null);
	const lastChatRef = useRef<FloatingChatInfo | null>(null);
	const loadedRooms = useRef<Set<string>>(new Set());
	const inputRef = useRef<HTMLInputElement>(null);
	const chatToDisplay = activeChat || lastChatRef.current;
	const roomId = chatToDisplay?.roomId;
	const friend = friends?.find(friend => friend.email === chatToDisplay?.senderMail);
	const group = groups?.find(group => String(group.id) === chatToDisplay?.roomId)
	const currentMessages = roomId ? (messages[roomId] || []) : [];

	const origins = {
		'top-left': 'origin-top-left',
		'top-right': 'origin-top-right',
		'bottom-left': 'origin-bottom-left',
		'bottom-right': 'origin-bottom-right'
	};

	if (activeChat) lastChatRef.current = activeChat;

	useEffect(() => {
		if (scrollRef.current)
				scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [currentMessages, isOpen]);

	useEffect(() => {
		if (isOpen && activeChat && friend && !loadedRooms.current.has(activeChat.roomId)) {
			loadHistory(activeChat.roomId, friend.id);
			loadedRooms.current.add(activeChat.roomId);
		}
	}, [activeChat, isOpen, friend]);

	useEffect(() => {
		if (isOpen && activeChat) {
			const timeout = setTimeout(() => {
				inputRef.current?.focus();
			}, 100);

			return () => clearTimeout(timeout);
		}
	}, [isOpen, activeChat]);

	return (
		<div
			onMouseDown={(e) => e.stopPropagation()}
			style={{ 
				width: `${menuSize.x}px`,
				height: `${menuSize.y}px`
			}}
			className={`absolute rounded-md bg-bg-color border border-overlay-border-color transition-all duration-400 flex flex-col overflow-hidden
						${horizontalClass}
						${verticalClass}
						${origins[originKey as keyof typeof origins]}
						${isOpen && !isDragging && activeChat ? 'scale-100 opacity-100 shadow-xl' : 'scale-0 opacity-0 pointer-events-none'}`
					}
		>
			{activeChat?.type === 'private' ? (
				<ChatWindowPrivate
					friend={friend}
					roomId={roomId}
					scrollRef={scrollRef}
					inputRef={inputRef}
					currentMessages={currentMessages}
					setActiveChat={setActiveChat}
				/>
			) : (
				<ChatWindowGroup
					isOpen={isOpen}
					group={group}
					friends={friends}
					scrollRef={scrollRef}
					inputRef={inputRef}
					currentMessages={currentMessages}
					activeChat={chatToDisplay}
					setActiveChat={setActiveChat}
					loadedRooms={loadedRooms}
				/>
			)}
		</div>
	);
}