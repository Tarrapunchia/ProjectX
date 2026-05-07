import { FiUsers, FiUser, FiSearch } from 'react-icons/fi';
import { useState } from 'react';

interface Friend {
	id: number;
	name: string;
	surname: string;
	email: string;
	jobQualifier: string;
	isLoggedIn: boolean;
	avatarUrl: string;
}

interface ChatMenuProps {
	isOpen: boolean;
	isDragging: boolean;
	pos: { x: number, y: number };
	friends: Friend[];
}

const menuSize = { x: 400, y: 500};

export const ChatMenu = ({ isOpen, isDragging, pos, friends }: ChatMenuProps) => {
	const openLeft = pos.x + (menuSize.x + 20) > window.innerWidth;
	const openDown = pos.y - (menuSize.y + 20) < 0;

	const horizontalClass = openLeft ? 'right-16' : 'left-16';
	const verticalClass = openDown ? 'top-0' : 'bottom-0';
	
	const origins = {
		'top-left': 'origin-top-left',
		'top-right': 'origin-top-right',
		'bottom-left': 'origin-bottom-left',
		'bottom-right': 'origin-bottom-right'
	};
	const originKey = `${openDown ? 'top' : 'bottom'}-${openLeft ? 'right' : 'left'}` as keyof typeof origins;

	const [activeTab, setActiveTab] = useState('friends');
	const [searchQuery, setSearchQuery] = useState('');

	const filteredFriends = friends?.filter(friend => 
						`${friend.name} ${friend.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
	) || [];
	
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
						${origins[originKey]} 
						${isOpen && !isDragging ? 'scale-100 opacity-100 shadow-xl' : 'scale-0 opacity-0 pointer-events-none'}`
		}>
			<div className="grid grid-cols-2 h-12 bg-side-bg-color border-b border-overlay-border-color shrink-0">
				<button 
					onClick={() => setActiveTab('friends')}
					className={`group flex items-center justify-center border-r border-overlay-border-color transition-all focus:outline-none
								${activeTab === 'friends'
									? 'bg-bg-color border-2 border-owner-color rounded-tl-md'
									: 'hover:bg-bg-color'
								}`}
				>
					<FiUser size={24}
							className={`transition-transform duration-200 group-hover:scale-120
										${activeTab === 'friends' ? 'text-owner-color' : ''}`}
					/>
				</button>
				<button onClick={() => setActiveTab('groups')}
					className={`group flex items-center justify-center border-r border-overlay-border-color transition-all focus:outline-none
								${activeTab === 'groups'
									? 'bg-bg-color border-2 border-owner-color rounded-tr-md'
									: 'hover:bg-bg-color'
								}`}
				>
					<FiUsers size={24}
							className={`transition-transform duration-200 group-hover:scale-120
										${activeTab === 'groups' ? 'text-owner-color' : ''}`}
					/>
				</button>
			</div>
				{activeTab === 'friends' && (
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
				)}

				<div className="flex-1 overflow-y-auto p-2"> 
				{activeTab === 'friends' ? (
					<div className="animate-fadeIn space-y-1">
						{filteredFriends.length > 0 ? (
							filteredFriends.map((friend) => (
								<div
									key={friend.id}
									className="flex items-center gap-3 p-3 rounded-md hover:bg-side-bg-color cursor-pointer transition-colors group/item"
								>
									<div className="relative shrink-0">		
										<div className=" w-10 h-10 rounded-full bg-overlay-border-color flex items-center justify-center text-text-main font-bold border border-overlay-border-color">
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
				) : (
					<div className="animate-fadeIn p-4 text-center opacity-50">
						<p className="text-sm">Group section incoming</p>
					</div>
				)}
			</div>
		</div>
	)
}









// import { FiUsers, FiUser } from 'react-icons/fi';
// import { useState } from 'react';

// interface Friend {
// 	id: number;
// 	name: string;
// 	surname: string;
// 	email: string;
// 	jobQualifier: string;
// 	isLoggedIn: boolean;
// 	avatarUrl: string;
// }

// interface ChatMenuProps {
// 	isOpen: boolean;
// 	isDragging: boolean;
// 	pos: { x: number, y: number };
// 	friends: Friend[];
// }

// const menuSize = { x: 400, y: 500};

// export const ChatMenu = ({ isOpen, isDragging, pos, friends }: ChatMenuProps) => {
// 	const openLeft = pos.x + (menuSize.x + 20) > window.innerWidth;
// 	const openDown = pos.y - (menuSize.y + 20) < 0;

// 	const horizontalClass = openLeft ? 'right-16' : 'left-16';
// 	const verticalClass = openDown ? 'top-0' : 'bottom-0';
	
// 	const origins = {
// 		'top-left': 'origin-top-left',
// 		'top-right': 'origin-top-right',
// 		'bottom-left': 'origin-bottom-left',
// 		'bottom-right': 'origin-bottom-right'
// 	};
// 	const originKey = `${openDown ? 'top' : 'bottom'}-${openLeft ? 'right' : 'left'}` as keyof typeof origins;

// 	const [activeTab, setActiveTab] = useState('friends');
// 	const [searchQuery, setSearchQuery] = useState('');

// 	const filteredFriends = friends?.filter(friend => 
// 						`${friend.name} ${friend.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
// 	) || [];

// 	return (
// 		<div 
// 		onMouseDown={(e) => e.stopPropagation()}
// 		style={{
// 			width: `${menuSize.x}px`,
// 			height: `${menuSize.y}px`
// 		}}
// 		className={`absolute rounded-md bg-bg-color border border-overlay-border-color transition-all duration-400 flex flex-col overflow-hidden
// 						${horizontalClass} 
// 						${verticalClass} 
// 						${origins[originKey]} 
// 						${isOpen && !isDragging ? 'scale-100 opacity-100 shadow-xl' : 'scale-0 opacity-0 pointer-events-none'}`
// 		}>
// 			<div className="grid grid-cols-2 h-12 bg-side-bg-color border-b border-overlay-border-color shrink-0">
// 				<button 
// 					onClick={() => setActiveTab('friends')}
// 					className={`group flex items-center justify-center border-r border-overlay-border-color transition-all focus:outline-none
// 								${activeTab === 'friends'
// 									? 'bg-bg-color border-2 border-owner-color rounded-tl-md'
// 									: 'hover:bg-bg-color'
// 								}`}
// 				>
// 					<FiUser size={24}
// 							className={`transition-transform duration-200 group-hover:scale-120
// 										${activeTab === 'friends' ? 'text-owner-color' : ''}`}
// 					/>
// 				</button>
// 				<button onClick={() => setActiveTab('groups')}
// 					className={`group flex items-center justify-center border-r border-overlay-border-color transition-all focus:outline-none
// 								${activeTab === 'groups'
// 									? 'bg-bg-color border-2 border-owner-color rounded-tr-md'
// 									: 'hover:bg-bg-color'
// 								}`}
// 				>
// 					<FiUsers size={24}
// 							className={`transition-transform duration-200 group-hover:scale-120
// 										${activeTab === 'groups' ? 'text-owner-color' : ''}`}
// 					/>
// 				</button>
// 			</div>
// 			<div className="flex-1 overflow-y-auto p-2">
// 				{activeTab === 'friends' ? (
// 					<div className="animate-fadeIn space-y-1">
// 						{friends.length > 0 ? (
// 							friends.map((friend) => (
// 								<div
// 									key={friend.id}
// 									className="flex items-center gap-3 p-3 rounded-md hover:bg-side-bg-color cursor-pointer transition-colors group/item"
// 								>
// 									<div className="relative">		
// 										<div className=" w-10 h-10 rounded-full bg-overlay-border-color flex items-center justify-center text-text-main font-bold border border-overlay-border-color">
// 											{friend.avatarUrl && friend.avatarUrl !== '/avatar/default.png' ? (
// 												<img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
// 											) : (
// 												<span>{friend.name.charAt(0)}{friend.surname.charAt(0)}</span>
// 											)}
// 										</div>
// 										<span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-bg-color
// 													${friend.isLoggedIn ? 'bg-green-500' : 'bg-gray-400'}`}
// 										/>
// 									</div>

// 									<div className="flex flex-col flex-1">
// 										<span className="text-sm font-medium text-text-main group-hover/item:text-owner-color transition-colors">
// 											{friend.name} {friend.surname}
// 										</span>
// 										<span className="text-[10px] opacity-60">
// 											{friend.isLoggedIn ? 'Online' : 'Offline'}
// 										</span>
// 									</div>
// 								</div>
// 							))
// 						) : (
// 							<div className="h-full flex flex-col items-center justify-center py-20 opacity-40">
// 								<FiUser size={40} className="mb-2" />
// 								<p className="text-sm italic">No friends found</p>
// 							</div>
// 						)}
// 					</div>
// 				) : (
// 					<div className="animate-fadeIn p-4 text-center opacity-50">
// 						<p className="text-sm">Group section incoming</p>
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	)
// }