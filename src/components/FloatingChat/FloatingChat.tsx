import { useState, useRef, useEffect } from 'react';
import { ChatButton } from './ChatButton';
import { ChatMenu } from './ChatMenu';
import { ChatBox } from './ChatBox';
import { ChatWindow } from './ChatWindow';
import { useWebSocket, type FloatingChatInfo } from '../../utilities/WebSocketContext';

function FloatingChat() {
	const [isOpen, setIsOpen] = useState(false);
	const [pos, setPos] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 120 });
	const [isDragging, setIsDragging] = useState(false);
	const [draggedChat, setDraggedChat] = useState<FloatingChatInfo | null>(null);
	const [draggedPos, setDraggedPos] = useState({ x: 0, y: 0});
	const [showTrash, setShowTrash] = useState(false);
	const [isOverTrash, setIsOverTrash] = useState(false);
	const [activeChat, setActiveChat] = useState<FloatingChatInfo | null>(null);
	const { friends, groups, closeFloatingChat } = useWebSocket();
	
	const offset = useRef({ x: 0, y: 0});
	const hasMoved = useRef(false);
	const startPos = useRef({ x: 0, y: 0 });
	const avatarStartPos = useRef({ x: 0, y: 0});
	const avatarHasMoved = useRef(false);
	const hiddenChatId = showTrash && draggedChat ? draggedChat.roomId : null;
	const draggedFriend = friends?.find(f => f.email === draggedChat?.senderMail);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isDragging && !draggedChat) {
				const rawX = e.clientX - offset.current.x;
				const rawY = e.clientY - offset.current.y;
				const maxX = window.innerWidth - 60;
				const maxY = window.innerHeight - 60;

				const clampedX = Math.max(4, Math.min(rawX, maxX));
				const clampedY = Math.max(4, Math.min(rawY, maxY));
				setPos({ x: clampedX, y: clampedY });

				if (Math.abs(e.clientX - startPos.current.x) > 3 ||  Math.abs(e.clientY - startPos.current.y) > 3)
					hasMoved.current = true;
			}

			if (draggedChat) {
				setDraggedPos({ x: e.clientX, y: e.clientY });

				const dist = Math.sqrt(
								Math.pow(e.clientX - avatarStartPos.current.x, 2) +
								Math.pow(e.clientY - avatarStartPos.current.y, 2)
				);

				if (dist > 3 && !avatarHasMoved.current) {
					avatarHasMoved.current = true;
					setShowTrash(true);
				}

				const buttonCenterX = pos.x + 28;
				const buttonCenterY = pos.y + 28;

				const collisionDist = Math.sqrt(
					Math.pow(e.clientX - buttonCenterX, 2) +
					Math.pow(e.clientY - buttonCenterY, 2)
				);

				setIsOverTrash(collisionDist < 35);
			}
		};

		const handleMouseUp = () => {
			if (isOverTrash && draggedChat) {
				closeFloatingChat(draggedChat.roomId);
				if (activeChat?.roomId === draggedChat.roomId) 
					setActiveChat(null);
			}

			setIsDragging(false);
			setDraggedChat(null);
			setShowTrash(false);
			setIsOverTrash(false);
			avatarHasMoved.current = false;
		};

		if (isDragging || draggedChat) {
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, draggedChat, isOverTrash, pos]);

	useEffect(() => {
		const handleResize = () => {
			setPos(prevPos => ({
				x: Math.min(prevPos.x, window.innerWidth - 60),
				y: Math.min(prevPos.y, window.innerHeight - 60)
			}));
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className="fixed select-none z-50"
			style={{ left: pos.x, top: pos.y }}
			onMouseDown={ (e) => {
				setIsDragging(true);
				hasMoved.current = false;

				startPos.current = {
					x: e.clientX,
					y: e.clientY
				};

				offset.current = {
					x: e.clientX - pos.x,
					y: e.clientY - pos.y
				};
			}}
			onMouseUp={ () => setIsDragging(false) }
		>
			{draggedChat && (
				<div
					className={`fixed pointer-events-none z-60 w-12 h-12 rounded-full border-2 overflow-hidden
								${isOverTrash ? 'border-red-500 bg-red-950/80 scale-90' : 'border-owner-color bg-side-bg-color'}`}
					style={{
						left: draggedPos.x,
						top: draggedPos.y,
						transform: 'translate(-50%, -50%)',
						opacity: avatarHasMoved.current ? 1 : 0
					}}
				>
					<div className="w-full h-full flex items-center justify-center text-owner-color font-bold">
						{draggedFriend?.avatarUrl && draggedFriend.avatarUrl !== '/avatar/default.png' ? (
							<img src={draggedFriend.avatarUrl} alt="" className="w-full h-full object-cover" />
						) : (
							<span className="text-lg uppercase">
								{draggedFriend?.name?.charAt(0)}{draggedFriend?.surname?.charAt(0)}
							</span>
						)}
					</div>
				</div>
			)}
			<ChatBox 
				isOpen={isOpen}
				isDragging={isDragging}
				hiddenChatId={hiddenChatId}
				pos={pos.y}
				friends={friends || []}
				activeChat={activeChat}
				setActiveChat={setActiveChat}
				onAvatarDragStart={(chat, x, y) => {
					setDraggedChat(chat);
					setDraggedPos({ x, y});
					avatarStartPos.current = { x, y };
				}}
			/>
			<ChatButton
				isOpen={isOpen}
				isDeleting={showTrash}
				onClick={() => {
					if (!hasMoved.current) {
						setIsOpen(!isOpen);
						if (isOpen) setActiveChat(null);
					}
				}}
			/>
			<ChatMenu
				isOpen={isOpen}
				isDragging={isDragging}
				pos={pos}
				friends={friends || []}
				groups={groups || []}
				activeChat={activeChat}
				setActiveChat={setActiveChat}
			/>
			<ChatWindow
				isOpen={isOpen}
				isDragging={isDragging}
				pos={pos}
				activeChat={activeChat}
				friends={friends || []}
				setActiveChat={setActiveChat}
			/>
		</div>
	);
}

export default FloatingChat;