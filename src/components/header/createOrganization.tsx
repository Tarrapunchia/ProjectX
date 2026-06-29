import { useWebSocket, type User } from '../../utilities/WebSocketContext';

interface CreateOrganizationProps {
	setCreateOpen: (value: boolean) => void;
	activeUser: User | null;
}

export const CreateOrganization = ({ setCreateOpen, activeUser }: CreateOrganizationProps) => {

	return (
		<div
			onClick={ () => setCreateOpen(false) }
			className="fixed inset-0 flex items-center justify-center bg-bg-color/0 w-full h-full z-100 backdrop-blur-sm text-text-main"
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="flex flex-col bg-bg-color w-[80%] h-[80%] rounded-xl border-overlay-border-color border"
			>
				<div className="flex-1 pl-6 pt-6">
					<div className="text-2xl">
						Nome
					</div>
					<input className="border h-10 mt-2 pl-2 text-xl font-bold rounded-sm border-overlay-border-color transition-all duration-300 outline-none hover:border-owner-color focus:border-owner-color" />
					<div className="">
						email
					</div>
				</div>
				<div className="flex-1 bg-white">

				</div>
				<div className="flex-1 bg-green-600">

				</div>
			</div>
		</div>
	)
}