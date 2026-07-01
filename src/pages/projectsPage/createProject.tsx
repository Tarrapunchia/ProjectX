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
			il poster non gestisce i partecipanti al progetto
			mentre il getter dei progetti restituisce i participants
			non c'e' modo di salvare i participants di un progetto nel server
*/