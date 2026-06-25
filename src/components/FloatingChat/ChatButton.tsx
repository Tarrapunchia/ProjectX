import { FiMessageSquare, FiX, FiTrash2 } from 'react-icons/fi';

interface ChatButtonProps {
	isOpen: boolean;
	isDeleting?: boolean;
	onClick: () => void;
}

export const buttonSize = 56;

export const ChatButton = ({ isOpen, isDeleting, onClick }: ChatButtonProps) => (
	<button
		style= {{ 
			width: `${buttonSize}px`,
			height: `${buttonSize}px`
		}}
		className="flex items-center justify-center w-14 h-14 rounded-full bg-bg-color text-text-main shadow-lg hover:scale-110 hover:active:scale-95 transition-transform focus:outline-none border border-overlay-border-color cursor-pointer"
		onClick={onClick}
	>
		{isDeleting? (
			<FiTrash2
				size={26}
			/>
		) : (
			isOpen? ( <FiX size={26} /> ) : ( <FiMessageSquare size={26} /> )
		)}
	</button>
);