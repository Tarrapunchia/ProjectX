import { useState } from 'react';
import { FiX, FiSearch, FiUser } from 'react-icons/fi';
import { type Friend, type Group } from '../../../../utilities/WebSocketContext';
import helper from '../../../../utilities/helpers';

interface ChatOptionsAddProps {
	openOption: 'add' | 'edit' | 'leave' | null;
	setOpenOption: (value: 'add' | 'edit' | 'leave' | null) => void;
	friends: Friend[];
	group?: Group;
}

export const ChatOptionsAdd = ({ setOpenOption, openOption, friends, group }: ChatOptionsAddProps) => {
	const participantIds = group?.participants.map(p => p.userId) || [];
	const friendsNotInGroup = friends.filter(f => !participantIds?.includes(f.id));
	
	const [searchQuery, setSearchQuery] = useState('');
	const filteredFriends = friendsNotInGroup.filter(friend =>
							`${friend.name} ${friend.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
	) || [];

	return (
		<div className={`absolute origin-center w-full h-full z-20 bg-bg-color/90 transition-all duration-400
						${openOption ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
			<div className="flex justify-end mt-3 mr-3">
				<button
					onClick={() => setOpenOption(null)}
					className="bg-bg-color rounded-full p-1 hover:cursor-pointer hover:text-owner-color hover:bg-side-bg-color transition-colors">
					<FiX size={24}/>
				</button>
			</div>

			<div className="px-2 pt-2 bg-bg-color">
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

			<div className="overflow-y-auto no-scrollbar">
				{filteredFriends.length > 0 ? (
					filteredFriends.map((friend) => (
						<div
							key={friend.id}
							className="flex items-center gap-3 p-3 mt-3 rounded-md hover:bg-side-bg-color cursor-pointer transition-colors group/item"
							onClick={() => {
								// helper.poster('/api/v1/groups/addPartecipant', friend.id, group?.id)
							}}						
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
					<div className="h-full flex flex-col items-center py-35 opacity-80">
						<FiUser size={40} className="mb-2" />
						<p className="text-sm italic">Nessun amico trovato</p>
					</div>
				)}
			</div>
		</div>
	)
}