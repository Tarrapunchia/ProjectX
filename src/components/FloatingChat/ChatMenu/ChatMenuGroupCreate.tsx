import { FiX, FiCheck } from 'react-icons/fi';
import { useRef, useState } from 'react';
import helper from '../../../utilities/helpers';
// import { useWebSocket, type Group } from '../../../utilities/WebSocketContext';

interface ChatMenuGroupCreateProps {
	createGroup: boolean;
	setCreateGroup: (value: boolean) => void;
}

export const ChatMenuGroupCreate = ({ createGroup, setCreateGroup }: ChatMenuGroupCreateProps) => {
	// const { setGroups, groups } = useWebSocket();
	const groupName = useRef('');
	const description = useRef('');

	const [isError, setIsError] = useState(false);
	const [shakeKey, setShakeKey] = useState(0);

	const handleGroupCreation = async () => {
		if (!groupName.current.trim()) {
			setIsError(true);
			setShakeKey(prev => prev + 1);
			
			return;
		}

		setIsError(false);
		await helper.poster("/api/v1/groups/addGroup", {name: groupName.current.trim(), description: description.current})
		
		setCreateGroup(false);
	}

	return (
		<div className={`absolute w-full h-full origin-center bg-bg-color transition-all duration-300
			${createGroup ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}
		`}>
			<div className="mt-3">
				<span className="ml-7">
					Nome Gruppo
				</span>
				<div className="flex items-center justify-center mt-2">
					<input
						key={shakeKey}
						type="text"
						placeholder="Inserisci nome gruppo..."
						onChange={(e) => {
							groupName.current = e.target.value;
							if (isError && e.target.value.trim()) setIsError(false);
						}}
						className={`flex relative border border-overlay-border-color rounded-full h-10 w-90 pl-3 focus:outline-none focus:border-owner-color
								${isError
									? 'border-red-500 bg-red-50/5 focus:border-red-500'
									: 'border-overlay-border-color focus:border-owner-color'
								}
								${isError && shakeKey > 0 ? 'animate-shake' : ''}`}
					/>
				</div>
			</div>
			<div className="mt-7">
				<span className="ml-7">
					Descrizione
				</span>
				<div className="flex items-center justify-center mt-2">
					<textarea 
						placeholder="Inserisci descrizione gruppo..."
						spellCheck="false"
						onChange={(e) => {description.current = e.target.value}}
						className="flex relative border border-overlay-border-color rounded-md h-40 w-90 pl-3 resize-none no-scrollbar focus:outline-none focus:border-owner-color"
					/>
				</div>
			</div>
			<div className="flex items-center justify-around mt-20">
				<button
					onClick={handleGroupCreation}
					className="flex items-center justify-start w-40 rounded-md border border-overlay-border-color bg-bg-color p-2 hover:bg-side-bg-color hover:text-owner-color hover:border-owner-color hover:cursor-pointer"
				>
					<FiCheck size={24} className="mr-4"/>
					<span>
						Conferma
					</span>
				</button>
				<button
					onClick={() => setCreateGroup(false)}
					className="flex items-center justify-start w-40 rounded-md border border-overlay-border-color bg-bg-color p-2 m-1 hover:bg-side-bg-color hover:text-red-600 hover:border-owner-color hover:cursor-pointer"
				>
					<FiX size={24} className="mr-6"/>
					<span>
						Annulla
					</span>
				</button>
			</div>
		</div>
	)
}