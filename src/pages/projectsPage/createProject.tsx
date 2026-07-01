import type React from 'react';
import { useWebSocket } from '../../utilities/WebSocketContext';
import type { SetStateAction } from 'react';

interface CreateProjectProps {
	setCreateProject: React.Dispatch<SetStateAction<boolean>>;
}

export const CreateProject = ({ setCreateProject }: CreateProjectProps) => {
	
	const handleClose = () => {
		setCreateProject(false);
	}
	
	return (
		<div 
			onClick={handleClose}
			className="flex items-center justify-center fixed inset-0 w-full h-full backdrop-blur-sm"
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="bg-bg-color border border-overlay-border-color rounded-xl max-w-300 w-[80%] h-[80%]"
			>
				
			</div>
		</div>
	)
}