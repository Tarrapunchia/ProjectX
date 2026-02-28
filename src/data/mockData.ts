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
	{ id: '1', owner: 'Space Travel Partner Name Too Long Test', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'todo' },
	{ id: '2', owner: 'Piero', name: 'Trascendence', description: 'If the description length is more than two line the text gets cutted off and three points are shown instead This is some hidden text', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'in-progress' },
	{ id: '3', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'in-progress' },
	{ id: '4', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'todo' },
	{ id: '5', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'review' },
	{ id: '6', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'in-progress' },
	{ id: '7', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'review' },
	{ id: '8', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'todo' },
	{ id: '9', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'todo' },
	{ id: '10', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
	{ id: '11', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
	{ id: '12', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
	{ id: '13', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
	{ id: '14', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
	{ id: '15', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
	{ id: '16', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
	{ id: '17', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
];

export const MOCK_FRIENDS: Friend[] = [
	{ id: '1', name: 'Osme', avatar: 'https://picsum.photos/id/65/50/50', status: 'online' },
	{ id: '2', name: 'Fabio', avatar: 'https://picsum.photos/id/66/50/50', status: 'offline' },
	{ id: '3', name: 'Giulia', avatar: 'https://picsum.photos/id/67/50/50', status: 'away' },
];