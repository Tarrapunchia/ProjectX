import { useState } from 'react';
import { useWebSocket, type FloatingChatInfo, type Group, type ChatMessage } from '../../utilities/WebSocketContext';
import { FiChevronLeft, FiSend, FiMenu, FiUserPlus, FiEdit, FiLogOut } from 'react-icons/fi';

interface ChatWindowGroupProps {
	group?: Group;
	scrollRef: any;
	inputRef: any;
	currentMessages: any[];
	setActiveChat: (chat: FloatingChatInfo | null) => void;
}

export const ChatWindowGroup = ({ group, scrollRef, inputRef, currentMessages, setActiveChat }: ChatWindowGroupProps) => {
	const { myUserId, setMessages, send } = useWebSocket();
	const [inputText, setInputText] = useState('');
	const [isOptionsOpen, setIsOptionsOpen] = useState(false);
	
	const handleSendMessage = () => {
		if (!inputText.trim() || !myUserId || !group) return;

		const roomId = group.id;
		const text = inputText.trim();
		console.log(roomId);
		
		send({
			type:"room:message",
			roomId:roomId,
			payload:text
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
						onClick={() => {
							if (!isOptionsOpen)
								setActiveChat(null);
							else
								setIsOptionsOpen(false);
						}}
						className="p-2 rounded-md text-owner-color transition-colors hover:bg-bg-color hover:cursor-pointer"
					>
						<FiChevronLeft size={20} />
					</button>

					<div className="flex items-center gap-3">
						<div className="relative">
							<div className="w-9 h-9 rounded-md bg-overlay-border-color flex items-center justify-center overflow-hidden border border-overlay-border-color">
								<span className="font-bold uppercase">
									{group?.name.charAt(0)}
								</span>
							</div>
						</div>
						<div className="flex flex-col">
							<span className="text-xs font-semibold text-text-main leading-tight">
								{group ? `${group.name}` : 'Gruppo'}
							</span>
						</div>
					</div>
				</div>
				<button
					onClick={() => setIsOptionsOpen(!isOptionsOpen)}
					className="relative p-2 rounded-md hover:text-owner-color hover:bg-bg-color hover:cursor-pointer">
					<FiMenu size={24}/>
				</button>
			</div>

			{isOptionsOpen ? (
				<>
					<div className="flex justify-center items-center w-full mt-5 gap-12">
						<button className="border border-overlay-border-color rounded-md p-1 hover:cursor-pointer hover:border-owner-color transition-colors">
							<FiUserPlus size={40} className="stroke-1"/>
						</button>
						<button className="border border-overlay-border-color rounded-md p-1 hover:cursor-pointer hover:border-owner-color transition-colors">
							<FiEdit size={40} className="stroke-1"/>
						</button>
						<button className="border border-overlay-border-color rounded-md p-1 hover:cursor-pointer hover:border-owner-color hover:text-red-700 transition-colors">
							<FiLogOut size={40} className="stroke-1"/>
						</button>
					</div>
					<div className="flex items-center justify-start w-full p-3 mt-2 font-light">
						{group?.participants.length} membri
					</div>
					<div className="animate-fadeIn space-y-1">
						{group?.participants.map(p => (
							<div
								key={p.user.id}
								className="flex items-center gap-3 p-3 rounded-md hover:bg-side-bg-color cursor-pointer transition-colors group/item"
							>
								<div className="relative shrink-0">
									<div className="w-10 h-10 rounded-full bg-overlay-border-color flex items-center justify-center overflow-hidden border border-overlay-border-color">
										{p.user.avatarUrl && p.user.avatarUrl !== '/avatar/default.png' ? (
											<img src={p.user.avatarUrl} className="w-full h-full object-cover" alt=""/>
										) : (
											<span className="font-bold uppercase">
												{p.user.name.charAt(0)}{p.user.surname.charAt(0)}
											</span>
										)}
									</div>
									<span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-bg-color
											${p.user.isLoggedIn ? 'bg-green-500' : 'bg-gray-400'}`}
									/>
								</div>
								<div className="flex flex-col flex-1">
									<span className="text-sm font-medium text-text-main group-hover/item:text-owner-color transition-colors">
										{p.user.name} {p.user.surname}
									</span>
									<span className="text-[10px] opacity-60">
										{p.user.isLoggedIn ? 'Online' : 'Offline'}
									</span>
								</div>
							</div>
						))}
					</div>
				</>
			) : (
				<>
					<div ref={scrollRef}
						className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-bg-color/50"
					>
						{currentMessages.length > 0 ? (
							currentMessages.map((msg) => {
								const isMe = msg.senderId === myUserId;

								return (
									<div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
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

					<div className="p-3 bg-side-bg-color border-t border-overlay-border-color shrink-0">
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
			)}
		</>
	)
}