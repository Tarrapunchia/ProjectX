import { FiUsers, FiUser, FiSearch } from 'react-icons/fi';
import { useState, memo } from 'react';
import { type FloatingChatInfo } from '../../utilities/WebSocketContext';
import { ChatMenuPrivate } from './ChatMenuPrivate';

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
	activeChat: FloatingChatInfo | null;
	setActiveChat: (chat: FloatingChatInfo | null) => void;
}

export const getFloatingLayout = (pos: { x: number, y: number }, size: { x: number, y: number }) => {
	const openLeft = pos.x + (size.x + 20) > window.innerWidth;
	const openDown = pos.y - (size.y + 20) < 0;

	const horizontalClass = openLeft ? 'right-16' : 'left-16';
	const verticalClass = openDown ? 'top-0' : 'bottom-0';

	const originKey = `${openDown ? 'top' : 'bottom'}-${openLeft ? 'right' : 'left'}`;

	return { horizontalClass, verticalClass, originKey };
};

export const menuSize = { x: 400, y: 500};

export const ChatMenu = memo(({ isOpen, isDragging, pos, friends, activeChat, setActiveChat }: ChatMenuProps) => {

	const origins = {
		'top-left': 'origin-top-left',
		'top-right': 'origin-top-right',
		'bottom-left': 'origin-bottom-left',
		'bottom-right': 'origin-bottom-right'
	};

	const { horizontalClass, verticalClass, originKey } = getFloatingLayout(pos, menuSize);

	const [activeTab, setActiveTab] = useState('friends');
	const [searchQuery, setSearchQuery] = useState('');
	
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
						${isOpen && !isDragging && !activeChat ? 'scale-100 opacity-100 shadow-xl' : 'scale-0 opacity-0 pointer-events-none'}`
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
					<ChatMenuPrivate 
						friends= {friends}
						setActiveChat= {setActiveChat}
						searchQuery= {searchQuery}
					/>
				) : (
					<div className="animate-fadeIn p-4 text-center opacity-50">
						<p className="text-sm">Group section incoming</p>
					</div>
				)}
			</div>
		</div>
	)
});
