import { useRef } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { useWebSocket, type User } from '../../utilities/WebSocketContext';

interface CreateOrganizationProps {
	setCreateOpen: (value: boolean) => void;
	activeUser: User | null;
}

export const CreateOrganization = ({ setCreateOpen, activeUser }: CreateOrganizationProps) => {
	const { organizations } = useWebSocket();
	const setOrganizations = useWebSocket();
	const formRef = useRef<HTMLFormElement>(null);

	const handleClose = () => {
		formRef.current?.reset();
		setCreateOpen(false);
	}

	const handleConfirm = () => {
		if (!formRef.current) return;

		const formData = new FormData(formRef.current);
		const data = Object.fromEntries(formData.entries());

		console.log("Org Data:", data);
		if (!data.id || !data.name || !data.city || data.address || data.country)
			console.log("empty iva");
		handleClose();
	}

	return (
		<div
			onClick={handleClose}
			className="fixed inset-0 flex items-center justify-center bg-bg-color/0 w-full h-full z-100 backdrop-blur-sm text-text-main"
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="flex flex-col bg-bg-color overflow-y-auto no-scrollbar w-[80%] h-[80%] max-w-300 rounded-xl border-overlay-border-color border"
			>
				<div className="flex-none flex items-center justify-center text-4xl pt-8 pb-20 px-12 line-clamp-2">
					Crea una nuova organizzazione
				</div>
				<form
					ref={formRef}
					className="flex-1 px-6 py-6 flex flex-wrap justify-center gap-x-24 gap-y-4"
				>
					<div className="flex flex-col">
						<div className="text-2xl">
							P. IVA*
						</div>
						<input name="id" className="border h-10 mt-2 pl-2 text-xl font-bold rounded-sm border-overlay-border-color transition-all duration-300 outline-none hover:border-owner-color focus:border-owner-color" />
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Nome*
						</div>
						<input name="name" className="border h-10 mt-2 pl-2 text-xl font-bold rounded-sm border-overlay-border-color transition-all duration-300 outline-none hover:border-owner-color focus:border-owner-color" />
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Email
						</div>
						<input name="email" className="border h-10 mt-2 pl-2 text-xl font-bold rounded-sm border-overlay-border-color transition-all duration-300 outline-none hover:border-owner-color focus:border-owner-color" />
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Numero di telefono
						</div>
						<input name="phone" className="border h-10 mt-2 pl-2 text-xl font-bold rounded-sm border-overlay-border-color transition-all duration-300 outline-none hover:border-owner-color focus:border-owner-color" />
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Città*
						</div>
						<input name="city" className="border h-10 mt-2 pl-2 text-xl font-bold rounded-sm border-overlay-border-color transition-all duration-300 outline-none hover:border-owner-color focus:border-owner-color" />
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Indirizzo*
						</div>
						<input name="address" className="border h-10 mt-2 pl-2 text-xl font-bold rounded-sm border-overlay-border-color transition-all duration-300 outline-none hover:border-owner-color focus:border-owner-color" />
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Stato*
						</div>
						<input name="country" className="border h-10 mt-2 pl-2 text-xl font-bold rounded-sm border-overlay-border-color transition-all duration-300 outline-none hover:border-owner-color focus:border-owner-color" />
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Cap
						</div>
						<input name="cap" className="border h-10 mt-2 pl-2 text-xl font-bold rounded-sm border-overlay-border-color transition-all duration-300 outline-none hover:border-owner-color focus:border-owner-color" />
					</div>
				</form>
				<div className="flex-none flex flex-wrap justify-center pb-12 pt-12 text-2xl gap-4 sm:gap-8 md:gap-24 lg:gap-64 mx-4 sm:mx-12">
					<button
						onClick={handleConfirm}
						className="flex items-center justify-center gap-2 w-50 border border-overlay-border-color rounded-sm p-2 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-90 active:scale-110"
					>
						<FiCheck size={32}/>
						Conferma
					</button>
					<button
						onClick={handleClose}
						className="flex items-center justify-center gap-2 w-50 border border-overlay-border-color rounded-sm p-2 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-90 active:scale-110"
					>
						<FiX size={32} />
						Annulla
					</button>
				</div>
			</div>
		</div>
	)
}