import { useWebSocket } from '../../utilities/WebSocketContext';

interface CreateOrganizationProps {
	setCreateOpen: (value: boolean) => void;
}

export const CreateOrganization = ({ setCreateOpen }: CreateOrganizationProps) => {

	return (
		<div
			onClick={ () => setCreateOpen(false) }
			className="fixed inset-0 flex items-center justify-center bg-bg-color/0 w-full h-full z-100 backdrop-blur-sm">
			<div
				onClick={(e) => e.stopPropagation()}
				className="bg-bg-color w-[80%] h-[80%] rounded-xl border-overlay-border-color border">
			</div>
		</div>
	)
}