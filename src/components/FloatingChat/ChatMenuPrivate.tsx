import { useState } from 'react';
import { useWebSocket, type FloatingChatInfo } from '../../utilities/WebSocketContext';
import { FiUser, FiSearch } from 'react-icons/fi';

interface Friend {
	id: number;
	name: string;
	surname: string;
	email: string;
	jobQualifier: string;
	isLoggedIn: boolean;
	avatarUrl: string;
}

interface ChatMenuPrivateProps {
	friends: Friend[];
	setActiveChat: (chat: FloatingChatInfo | null) => void;
}

export const ChatMenuPrivate = ({ friends, setActiveChat }: ChatMenuPrivateProps) => {
	const { openFloatingChat } = useWebSocket();
	
	// Filters the friendlist using the searchQuery and sorts the result with online friends as first values
	const [searchQuery, setSearchQuery] = useState('');
	const filteredFriends = friends?.filter(friend =>
							`${friend.name} ${friend.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
	).sort((a, b) => {
		return Number(b.isLoggedIn) - Number(a.isLoggedIn);
	}) || [];

	return (
		<div>
			<div className="px-2 pt-2 border-overlay-border-color bg-side-bg-color/30">
				<div className="relative flex items-center">
					<FiSearch className="absolute left-3 text-gray-400" size={16} />
					<input
						type="text"
						placeholder="Cerca amici..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-bg-color border border-overlay-border-color focus:outline-none focus:border-owner-color text-text-main transition-colors"
					/>
				</div>
			</div>
			<div className="animate-fadeIn space-y-1 p-2">
				{filteredFriends.length > 0 ? (
					filteredFriends.map((friend) => (
						<div
							key={friend.id}
							onClick={() => {
								const newChat: FloatingChatInfo = {
									roomId: `private-${friend.id}`,
									senderMail: friend.email,
									type: 'private'
								};
								openFloatingChat(newChat);
								setActiveChat(newChat);
							}}
							className="flex items-center gap-3 p-3 rounded-md hover:bg-side-bg-color cursor-pointer transition-colors group/item"
						>
							<div className="relative shrink-0">		
								<div className=" w-10 h-10 rounded-full bg-overlay-border-color flex items-center justify-center text-text-main font-bold border border-overlay-border-color uppercase">
									{friend.avatarUrl && friend.avatarUrl !== '/avatar/default.png' ? (
										<img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
									) : (
										<span>{friend.name.charAt(0)}{friend.surname.charAt(0)}</span>
									)}
								</div>
								<span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-bg-color
											${friend.isLoggedIn ? 'bg-green-500' : 'bg-gray-400'}`}
								/>
							</div>

							<div className="flex flex-col flex-1">
								<span className="text-sm font-medium text-text-main group-hover/item:text-owner-color transition-colors">
									{friend.name} {friend.surname}
								</span>
								<span className="text-[10px] opacity-60">
									{friend.isLoggedIn ? 'Online' : 'Offline'}
								</span>
							</div>
						</div>
					))
				) : (
					<div className="h-full flex flex-col items-center justify-center py-20 opacity-40">
						<FiUser size={40} className="mb-2" />
						<p className="text-sm italic">Nessun amico trovato</p>
					</div>
				)}
			</div>
		</div>
	)
}