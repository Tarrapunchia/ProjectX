import { useRef, useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { useWebSocket, type User, type Organization } from '../../utilities/WebSocketContext';
import helpers from '../../utilities/helpers';

interface CreateOrganizationProps {
	setCreateOpen: (value: boolean) => void;
	activeUser: User | null;
}

export const CreateOrganization = ({ setCreateOpen, activeUser }: CreateOrganizationProps) => {
	const { organizations, setOrganizations } = useWebSocket();
	const formRef = useRef<HTMLFormElement>(null);

	const [errors, setErrors] = useState<string[]>([]);
	const [isShaking, setIsShaking] = useState(false);
	const [isDuplicate, setIsDuplicate] = useState(false);
	const [emailFormat, setEmailFormat] = useState(false);

	const handleClose = () => {
		formRef.current?.reset();
		setErrors([]);
		setCreateOpen(false);
	}

	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const handleConfirm = async () => {
		if (!formRef.current) return;

		const formData = new FormData(formRef.current);
		const data = Object.fromEntries(formData.entries());

		const requiredFields = ['id', 'name', 'email', 'phone', 'city', 'address', 'country', 'cap'];
		const newErrors: string[] = [];

		requiredFields.forEach(field => {
			if (!data[field] || String(data[field]).trim() === '')
				newErrors.push(field);
		});

		const emailValue = String(data.email).trim();
		if (emailValue !== '' && !EMAIL_REGEX.test(emailValue)) {
			newErrors.push('email');
			setEmailFormat(true);
		}

		const inputId = String(data.id).trim();
		const isDuplicate = organizations.some(org => String(org.id) === inputId);

		if (isDuplicate) {
			if (!newErrors.includes('id'))
				newErrors.push('id');
			setIsDuplicate(true);
		}

		if (newErrors.length > 0) {
			setErrors(newErrors);
			setIsShaking(true);
			setTimeout(() => setIsShaking(false), 500)
			return;
		}

		if (activeUser) {
			
			const apiPayload = {
				name: String(data.name).trim(),
				email: String(data.email).trim(),
				phone: String(data.phone).trim(),
				city: String(data.city).trim(),
				address: String(data.address).trim(),
				cap: String(data.cap).trim(),
				state: String(data.country).trim()
			};

			const res = await helpers.poster('/api/v1/organizations/addOrganization', apiPayload);
			
			if (res?.success) {
				const newOrg: Organization = {
					id: Number(res.data.id),
					name: String(data.name).trim(),
					email: String(data.email).trim(),
					phone: String(data.phone).trim(),
					city: String(data.city).trim(),
					address: String(data.address).trim(),
					cap: String(data.cap).trim(),
					state: String(data.country).trim(),
					ownerId: activeUser?.id,
					projects: [],
					members: [activeUser]
				}
				setOrganizations(prev => [...prev, newOrg]);
			}
		}

		setErrors([]);
		handleClose();
	}

	const handleInputChange = (fieldName: string) => {
		if (errors.includes(fieldName))
			setErrors(prev => prev.filter(e => e !== fieldName));
		if (fieldName === 'id')
			setIsDuplicate(false);
		if (fieldName === 'email')
			setEmailFormat(false);
	}

	const getInputClasses = (fieldName: string) => {
		const hasError = errors.includes(fieldName);
		return `border h-10 mt-2 pl-2 text-xl font-bold rounded-sm transition-all duration-300 outline-none
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
				<div className="flex-none flex items-center justify-center text-4xl pt-8 pb-20 px-12 line-clamp-2">
					Crea una nuova organizzazione
				</div>
				<form
					ref={formRef}
					className="flex-1 px-6 py-6 flex flex-wrap justify-center gap-x-24 gap-y-4"
				>
					<div className="flex flex-col">
						<div className="text-2xl">P. IVA</div>
						<input
							name="id"
							onChange={() => handleInputChange('id')}
							className={getInputClasses('id')}
						/>
						{isDuplicate && (
							<span className="text-red-500 pl-1 pt-1 text-sm">! Questa P. Iva è già registrata</span>
						)}
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Nome
						</div>
						<input
							name="name"
							onChange={() => handleInputChange('name')}
							className={getInputClasses('name')}
						/>
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Email
						</div>
						<input
							name="email"
							onChange={() => handleInputChange('email')}
							className={getInputClasses('email')}
						/>
						{emailFormat && (
							<span className="text-red-500 pl-1 pt-1 text-sm">! L'email deve seguire il formato *@*.*</span>
						)}
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Numero di telefono
						</div>
						<input
							name="phone"
							onChange={() => handleInputChange('phone')}
							className={getInputClasses('phone')}
						/>
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Città
						</div>
						<input
							name="city"
							onChange={() => handleInputChange('city')}
							className={getInputClasses('city')}
						/>
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Indirizzo
						</div>
						<input
							name="address"
							onChange={() => handleInputChange('address')}
							className={getInputClasses('address')}
						/>
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Stato
						</div>
						<input
							name="country"
							onChange={() => handleInputChange('country')}
							className={getInputClasses('country')}
						/>
					</div>

					<div className="flex flex-col">
						<div className="text-2xl">
							Cap
						</div>
						<input
							name="cap"
							onChange={() => handleInputChange('cap')}
							className={getInputClasses('cap')}
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