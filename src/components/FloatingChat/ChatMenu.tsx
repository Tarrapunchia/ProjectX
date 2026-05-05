import { FiUsers, FiUser } from 'react-icons/fi';
import { useState } from 'react';

interface ChatMenuProps {
	isOpen: boolean;
	isDragging: boolean;
	pos: { x: number, y: number };
}

const menuSize = { x: 400, y: 500};

export const ChatMenu = ({ isOpen, isDragging, pos }: ChatMenuProps) => {
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
	return (
		<div 
		onMouseDown={(e) => e.stopPropagation()}
		style={{
			width: `${menuSize.x}px`,
			height: `${menuSize.y}px`
		}}
		className={`absolute rounded-md bg-bg-color border border-overlay-border-color transition-all duration-400
						${horizontalClass} 
						${verticalClass} 
						${origins[originKey]} 
						${isOpen && !isDragging ? 'scale-100 opacity-100 shadow-xl' : 'scale-0 opacity-0 pointer-events-none'}`
		}>
			<div className="grid grid-cols-2 h-12 bg-side-bg-color rounded-t-md border-b border-overlay-border-color overflow-hidden">
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
		</div>
	)
}