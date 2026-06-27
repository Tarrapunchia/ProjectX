import ThemeToggle from './ThemeToggle';
import { FiPlusCircle } from 'react-icons/fi';
import { useWebSocket } from '../../utilities/WebSocketContext'

interface ProfileMenuProps {
	setActivePage: (page: string) => void;
}

export const ProfileMenu = ({ setActivePage }: ProfileMenuProps) => {
	const { activeUser } = useWebSocket();

	return (
		<div className="absolute w-80 h-80 z-50 right-0 top-14 no-scrollbar bg-side-bg-color border border-owner-color rounded-md text-text-main ">
			<div className="flex items-center flex-col w-full h-full mt-2 gap-4">
				<div className="flex w-full items-center justify-between pr-2 pl-4">
					<div className="text-lg max-w-[70%] line-clamp-1">
						{activeUser?.name} {activeUser?.surname}
					</div>
					<div className="w-20">
						<ThemeToggle />
					</div>
				</div>
				<button
					onClick={() => setActivePage('profile')}
					className="w-[90%] bg-category-bg-color border rounded-md border-overlay-border-color p-2 hover:cursor-pointer hover:border-owner-color hover:scale-105 transition-all duration-300 active:scale-95"
				>
					Visualizza profilo
				</button>
				<div className="flex flex-col overflow-y-auto no-scrollbar bg-category-bg-color w-[90%] h-[55%] border rounded-md border-overlay-border-color">
					<button className="flex p-2 gap-2 items-center justify-center border-b border-overlay-border-color hover:text-owner-color hover:cursor-pointer">
						<FiPlusCircle size={24}/>
						<span>
							Aggiungi organizzazione
						</span>
					</button>

				</div>
			</div>
		</div>
	)
}