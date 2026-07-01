import { useState, useRef, type SetStateAction } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { useWebSocket, type ProjectDetailed } from '../../utilities/WebSocketContext';
import helpers from '../../utilities/helpers';

interface CreateProjectProps {
	setCreateProject: React.Dispatch<SetStateAction<boolean>>;
}

export const CreateProject = ({ setCreateProject }: CreateProjectProps) => {
	const { activeOrg, setProjects } = useWebSocket();
	const formRef = useRef<HTMLFormElement>(null);

	const [errors, setErrors] = useState<string[]>([]);
	const [isShaking, setIsShaking] = useState(false);

	const handleClose = () => {
		formRef.current?.reset();
		setErrors([]);
		setCreateProject(false);
	}

	const parseLocalDate = (dateStr: string): Date => {
		const [year, month, day] = dateStr.split('-').map(Number);
		return new Date(year, month - 1, day);
	}

	const isValidDate = (dateStr: string): boolean => {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

		const [year, month, day] = dateStr.split('-').map(Number);
		const date = parseLocalDate(dateStr);

		return date.getFullYear() === year
			&& date.getMonth() === month - 1
			&& date.getDate() === day;
	}

	const getMinSelectableDate = (): string => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const year = tomorrow.getFullYear();
		const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
		const day = String(tomorrow.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	const handleConfirm = async () => {
			if (!formRef.current) return;
	
			const formData = new FormData(formRef.current);
			const data = Object.fromEntries(formData.entries());
	
			const requiredFields = ['name', 'description'];
			const newErrors: string[] = [];
	
			requiredFields.forEach(field => {
				if (!data[field] || String(data[field]).trim() === '')
					newErrors.push(field);
			});

			const closedAtInput = formRef.current.elements.namedItem('closedAt') as HTMLInputElement | null;
			const closedAtValue = String(data.closedAt || '').trim();

			if (closedAtInput?.validity.badInput)
				newErrors.push('closedAt');
			else if (closedAtValue !== '') {
				if (!isValidDate(closedAtValue))
					newErrors.push('closedAt');
				else {
					const closedAtDate = parseLocalDate(closedAtValue);
					const today = new Date();
					today.setHours(0, 0, 0, 0);

					if (closedAtDate <= today)
						newErrors.push('closedAt');
				}
			}
	
			if (newErrors.length > 0) {
				setErrors(newErrors);
				setIsShaking(true);
				setTimeout(() => setIsShaking(false), 500)
				return;
			}
	
			if (activeOrg) {
				const closedAt: Date | null = closedAtValue ? parseLocalDate(closedAtValue) : null;

				const apiPayload = {
					name: String(data.name).trim(),
					orgId: activeOrg.id,
					status: "TODO",
					description: String(data.description).trim()
				};
	
				const res = await helpers.poster('/api/v1/projects/addProject', apiPayload);
				
				if (res?.success) {
					const now: Date = new Date();
					const newProj: ProjectDetailed = {
						id: Date.now(),
						name: String(data.name).trim(),
						status: "TODO",
						description: String(data.description).trim(),
						createdAt: now,
						closedAt: closedAt,
						organization: {
							id: activeOrg.id,
							name: activeOrg.name
						},
						participants: []
					}
					setProjects(prev => [...prev, newProj]);
				}
			}
	
			setErrors([]);
			handleClose();
		}
	
	const handleInputChange = (fieldName: string) => {
		if (errors.includes(fieldName))
			setErrors(prev => prev.filter(e => e !== fieldName));
	}

	const getInputClasses = (fieldName: string) => {
		const hasError = errors.includes(fieldName);
		return `border mt-2 pl-2 text-xl font-bold rounded-sm transition-all duration-300 outline-none
			${hasError 
				? 'border-red-500 bg-red-50/5 focus:border-red-500' 
				: 'border-overlay-border-color hover:border-owner-color focus:border-owner-color'
			}
			${hasError && isShaking ? 'animate-shake' : ''}
		`;
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
				<div className="flex-none flex items-center justify-center text-3xl pt-8 pb-20 px-12 line-clamp-2">
					Crea un nuovo progetto per {activeOrg?.name}
				</div>

				<form
					ref={formRef}
					className="flex-1 px-6 py-6 flex flex-wrap justify-start gap-x-24 gap-y-4"
				>
					<div className="flex flex-col pl-24">
						<div className="text-2xl">Nome Progetto</div>
						<input
							name="name"
							onChange={() => handleInputChange('name')}
							className={`${getInputClasses('name')} h-10`}
						/>
					</div>

					<div className="flex flex-col w-full items-center">
						<div className="text-2xl">Descrizione</div>
						<textarea
							name="description"
							onChange={() => handleInputChange('description')}
							className={`${getInputClasses('description')} resize-none h-60 w-[80%] p-2`}
						/>
					</div>

					<div className="flex flex-col pl-24">
						<div className="text-2xl">Data di termine progetto</div>
						<input
							type="date"
							name="closedAt"
							min={getMinSelectableDate()}
							onChange={() => handleInputChange('closedAt')}
							className={`${getInputClasses('closedAt')} h-10 pr-2`}
						/>
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

/* 
	TODO

	- gestire la creazione del progetto tramite l'api

		'/api/v1/projects/addProject'
		-d '{
		"name": "string",
		"orgId": 0,
		"status": "string",
		"description": "string"

	- gestire anche i membri attivi sul progetto
	- capire se bisogna aggiungere nel server i membri relativi al progetto

	- per la creazione del progetto:

		nome: input (string)
		orgId: activeOrg.id (number)
		status: TODO (string)
		description: input (string)

		capire se aggiungere una barra di ricerca degli utenti
		relativi alla org attiva per poter aggiungere direttamente
		i membri al progetto
		
			!!! COMUNICARE A FABIO !!!
			il poster del progetto non gestisce i partecipanti al progetto
			mentre il getter dei progetti restituisce i participants
			non c'e' modo di salvare i participants di un progetto nel server
*/