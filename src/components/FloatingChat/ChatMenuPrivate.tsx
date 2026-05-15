import { useWebSocket, type FloatingChatInfo } from '../../utilities/WebSocketContext';
import { FiUser } from 'react-icons/fi';

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
	searchQuery: string;
}

export const ChatMenuPrivate = ({ friends, setActiveChat, searchQuery }: ChatMenuPrivateProps) => {
	const { openFloatingChat } = useWebSocket();
	
	// Filters the friendlist using the searchQuery and sorts the result with online friends as first values
	const filteredFriends = friends?.filter(friend =>
							`${friend.name} ${friend.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
	).sort((a, b) => {
		return Number(b.isLoggedIn) - Number(a.isLoggedIn);
	}) || [];

	return (
		<div className="animate-fadeIn space-y-1">
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
	)
}