import type { ProfileUser, Projects, Friend } from './types';

export const MOCK_USER: ProfileUser = {
	id: '1',
	firstName: 'Manuel',
	lastName: 'Chiaramello',
	email: 'mchiaram@42firenze.com',
	phoneNumber: '3312543322',
	avatar: 'https://picsum.photos/id/64/150/150',
	description: 'WiP',
}

export const MOCK_PROJECTS: Projects[] = [
	{ id: '1', leader: 'Piero', name: 'Trascendence', startDate: '2025-08-15', completed: false, completedDate: 'TBD', role: 'Frontend Dev' },
	{ id: '2', leader: 'Piero', name: 'Trascendence', startDate: '2025-08-15', completed: false, completedDate: 'TBD', role: 'Frontend Dev' },
	{ id: '3', leader: 'Piero', name: 'Trascendence', startDate: '2025-08-15', completed: false, completedDate: 'TBD', role: 'Frontend Dev' },
	{ id: '4', leader: 'Piero', name: 'Trascendence', startDate: '2025-08-15', completed: false, completedDate: 'TBD', role: 'Frontend Dev' },
	{ id: '5', leader: 'Piero', name: 'Trascendence', startDate: '2025-08-15', completed: false, completedDate: 'TBD', role: 'Frontend Dev' },
	{ id: '6', leader: 'Piero', name: 'Trascendence', startDate: '2025-08-15', completed: false, completedDate: 'TBD', role: 'Frontend Dev' },
	{ id: '7', leader: 'Piero', name: 'Trascendence', startDate: '2025-08-15', completed: false, completedDate: 'TBD', role: 'Frontend Dev' },
	{ id: '8', leader: 'Piero', name: 'Trascendence', startDate: '2025-08-15', completed: false, completedDate: 'TBD', role: 'Frontend Dev' },
	{ id: '9', leader: 'Piero', name: 'Trascendence', startDate: '2025-08-15', completed: false, completedDate: 'TBD', role: 'Frontend Dev' },
	{ id: '10', leader: 'Paolo', name: 'Minishell', startDate:'2025-05-04', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing' },
	{ id: '11', leader: 'Paolo', name: 'Minishell', startDate:'2025-05-04', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing' },
	{ id: '12', leader: 'Paolo', name: 'Minishell', startDate:'2025-05-04', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing' },
	{ id: '13', leader: 'Paolo', name: 'Minishell', startDate:'2025-05-04', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing' },
	{ id: '14', leader: 'Paolo', name: 'Minishell', startDate:'2025-05-04', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing' },
	{ id: '15', leader: 'Paolo', name: 'Minishell', startDate:'2025-05-04', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing' },
	{ id: '16', leader: 'Paolo', name: 'Minishell', startDate:'2025-05-04', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing' },
	{ id: '17', leader: 'Paolo', name: 'Minishell', startDate:'2025-05-04', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing' },
];

export const MOCK_FRIENDS: Friend[] = [
	{ id: '1', name: 'Osme', avatar: 'https://picsum.photos/id/65/50/50', status: 'online' },
	{ id: '2', name: 'Fabio', avatar: 'https://picsum.photos/id/66/50/50', status: 'offline' },
	{ id: '3', name: 'Giulia', avatar: 'https://picsum.photos/id/67/50/50', status: 'away' },
];