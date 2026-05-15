import { useState } from 'react';
import { FiSearch, FiUsers } from 'react-icons/fi';
import { useWebSocket, type Group, type FloatingChatInfo } from '../../utilities/WebSocketContext';

interface ChatMenuGroupProps {
	groups: Group[];
	setActiveChat: (chat: FloatingChatInfo | null) => void;
}

export const ChatMenuGroup = ({ groups, setActiveChat }: ChatMenuGroupProps) => {
	const { openFloatingChat } = useWebSocket();

	const [searchQuery, setSearchQuery] = useState('');
	const filteredGroups = groups?.filter(group =>
							`${group.name}`.toLowerCase().includes(searchQuery.toLowerCase())
	) || [];

	return (
		<div>
			<div className="px-2 pt-2 bg-bg-color">
				<div className="relative flex items-center">
					<FiSearch className="absolute left-3 text-gray-400" size={16} />
					<input
						type="text"
						placeholder="Cerca gruppi..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-1.5 text-xs text-main rounded-full border border-overlay-border-color focus:outline-none focus:border-owner-color transition-colors"
					/>
				</div>
			</div>
			<div className="animate-fadeIn space-y-1 p-2">
				{filteredGroups.length > 0 ? (
					filteredGroups.map((group) => (
						<div
							key={group.id}
							onClick={() => {
								const newChat: FloatingChatInfo = {
									roomId: `group-${group.id}`,
									senderMail: `${group.name}`,
									type: 'group'
								};
								openFloatingChat(newChat);
								setActiveChat(newChat);
							}}
							className="flex items-center gap-3 p-3 rounded-md hover:bg-side-bg-color cursor-pointer transition-colors group/item"
						>
							<div className="relative shrink-0">
								<div className="w-10 h-10 rounded-md bg-overlay-border-color flex items-center justify-center text-text-main font-bold border border-overlay-border-color uppercase">
									<span>{group.name.charAt(0)}</span>
								</div>
							</div>

							<div className="flex flex-col flex-1">
								<span className="text-sm font-medium text-text-main group-hover/item:text-owner-color transition-colors">
									{group.name}
								</span>
							</div>
						</div>
					))
				) : (
					<div className="h-full flex flex-col items-center justify-center py-20 opacity-40">
						<FiUsers size={40} className="mb-2" />
						<p className="text-sm italic">Nessun gruppo trovato</p>
					</div>
				)}
			</div>
		</div>
	)
}