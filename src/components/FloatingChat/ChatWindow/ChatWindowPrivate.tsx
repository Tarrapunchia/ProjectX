import { useEffect, useState } from 'react';
import { useWebSocket, type FloatingChatInfo, type Friend, type ChatMessage } from '../../../utilities/WebSocketContext';
import { FiChevronLeft, FiSend } from 'react-icons/fi';

interface ChatWindowPrivateProps {
	friend?: Friend;
	roomId?: string
	scrollRef: any;
	inputRef: any;
	currentMessages: any[];
	setActiveChat: (chat: FloatingChatInfo | null) => void;
}

export const ChatWindowPrivate = ({ friend, roomId, scrollRef, inputRef, currentMessages, setActiveChat }: ChatWindowPrivateProps) => {
	const { myUserId, send, setMessages } = useWebSocket();
	const [inputText, setInputText] = useState('');

	useEffect(() => {
		setInputText('');
	}, [roomId]);

	const handleSendMessage = () => {
		if (!inputText.trim() || !friend || !myUserId || !roomId) return;

		const text = inputText.trim();

		send({
			type: 'chat:send',
			toUserId: friend.id,
			text: text
		});

		const newMessage: ChatMessage = {
			id: `temp-${Date.now()}`,
			senderId: myUserId,
			content: text,
			timestamp: Date.now()
		};

		setMessages(prev => ({
			...prev,
			[roomId]: [...(prev[roomId] || []), newMessage]
		}));

		setInputText('');
	}

	return (
		<>
			<div className="h-14 bg-side-bg-color border-b border-overlay-border-color flex items-center px-2 shrink-0 justify-between">
				<div className="flex items-center gap-2">
					<button
						onClick={() => setActiveChat(null)}
						className="p-2 hover:bg-bg-color rounded-full text-owner-color transition-colors"
					>
						<FiChevronLeft size={20} />
					</button>

					<div className="flex items-center gap-3">
						<div className="relative">
							<div className="w-9 h-9 rounded-full bg-overlay-border-color flex items-center justify-center overflow-hidden border border-overlay-border-color">
									{friend?.avatarUrl && friend.avatarUrl !== '/avatar/default.png' ? (
										<img src={friend.avatarUrl} className="w-full h-full object-cover" alt="" />
									) : (
										<span className="text-xs font-bold uppercase">
											{friend?.name.charAt(0)}{friend?.surname.charAt(0)}
										</span>
									)}
							</div>
							<span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-side-bg-color ${friend?.isLoggedIn ? 'bg-green-500' : 'bg-gray-500'}`} />
						</div>
						<div className="flex flex-col">
							<span className="text-xs font-semibold text-text-main leading-tight">
								{friend ? `${friend.name} ${friend.surname}` : 'Utente'}
							</span>
							<span className="text-[10px] opacity-50">
								{friend?.isLoggedIn ? 'Online' : 'Offline'}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div ref={scrollRef}
				className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-bg-color/50"
			>
				{currentMessages.length > 0 ? (
					currentMessages.map((msg) => {
						const isMe = msg.senderId === myUserId;

						return (
							<div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`} >
								<div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs
												${isMe ? 'bg-owner-color text-white' : 'bg-side-bg-color border border-overlay-border-color'}`}>
									{msg.content}
								</div>
							</div>
						);
					})
				) : (
					<div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
						<div className="w-16 h-16 rounded-full border-2 border-dashed border-text-main mb-2 flex items-center justify-center">
							<FiSend size={24} />
						</div>
						<p className="text-xs italic">Inizia la conversazione...</p>
					</div>
				)}
			</div>

			<div className='p-3 bg-side-bg-color border-t border-overlay-border-color shrink-0'>
				<div className="relative flex items-center">
					<input
						ref={inputRef}
						type="text"
						placeholder="Scrivi un messaggio..."
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
						className="w-full bg-bg-color border border-overlay-border-color rounded-full py-2 pl-4 pr-12 text-xs focus:outline-none focus:border-owner-color transition-colors text-text-main"
					/>
					<button
						onClick={handleSendMessage}
						className="absolute right-0 w-8 h-8 flex items-center justify-center bg-owner-color text-white rounded-full hover:scale-105 transition-transform active:scale-95"
					>
						<FiSend size={14} />
					</button>
				</div>
			</div>
		</>
	);
}