import { type Group, type Friend } from '../../../../utilities/WebSocketContext';
import { FiUserPlus, FiEdit, FiLogOut } from 'react-icons/fi';
import { ChatOptionsAdd } from './ChatOptionsAdd';
import { useState } from 'react';

interface ChatGroupOptionsProps {
	group?: Group;
	friends: Friend[];
}

export const ChatGroupOptions = ({ group, friends }: ChatGroupOptionsProps) => {
	const [openOption, setOpenOption] = useState< 'add' | 'edit' | 'leave' | null >(null);

	return (
		<>
			<div className="flex justify-center items-center w-full mt-5 gap-12">
				<div className="shadow-[0_0_10px_rgba(172,134,0,0.7)] rounded-md">
					<button 
						onClick={() => setOpenOption('add')}
						className="border border-overlay-border-color p-1 rounded-md hover:cursor-pointer hover:border-owner-color hover:scale-110 transition-all"
					>
						<FiUserPlus size={40} className="stroke-1"/>
					</button>
				</div>
				<div className="shadow-[0_0_10px_rgba(172,134,0,0.7)] rounded-md">
					<button 
						onClick={() => setOpenOption('edit')}
						className="border border-overlay-border-color p-1 rounded-md hover:cursor-pointer hover:border-owner-color hover:scale-110 transition-all"
					>
						<FiEdit size={40} className="stroke-1"/>
					</button>
				</div>
				<div className="shadow-[0_0_10px_rgba(172,134,0,0.7)] rounded-md">
					<button 
						onClick={() => setOpenOption('leave')}
						className="border border-overlay-border-color p-1 rounded-md hover:cursor-pointer hover:border-owner-color hover:scale-110 transition-all"
					>
						<FiLogOut size={40} className="stroke-1"/>
					</button>
				</div>
			</div>
			<div className="flex items-center justify-start w-full ml-3 mt-4 font-thin">
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
			<ChatOptionsAdd
				openOption={openOption}
				setOpenOption={setOpenOption}
				friends={friends}
				group={group}
			/>
		</>
	)
}