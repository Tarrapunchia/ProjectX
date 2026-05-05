import { FiPlus } from 'react-icons/fi';

interface ChatButtonProps {
	isOpen: boolean;
	onClick: () => void;
}

export const ChatButton = ({ isOpen, onClick }: ChatButtonProps) => (
	<button
		className="flex items-center justify-center w-14 h-14 rounded-full bg-bg-color text-text-main shadow-lg hover:scale-110 hover:active:scale-95 transition-transform focus:outline-none border border-overlay-border-color cursor-pointer"
		onClick={onClick}
	>
		<FiPlus
			size={26}
			className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
		/>
	</button>
);