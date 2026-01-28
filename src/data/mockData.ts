import type { ProfileUser, CompletedProject, Friend } from '../pages/profilePage/types';

export const MOCK_USER: ProfileUser = {
	id: '1',
	firstName: 'Manuel',
	lastName: 'Chiaramello',
	email: 'mchiaram@42Firenze.com',
	phoneNumber: '3312543322',
	avatar: 'https://picsum.photos/id/64/150/150',
	description: 'WiP',
}

export const MOCK_PROJECTS: CompletedProject[] = [
	{ id: '1', name: 'Trascendence', completedDate: 'TBD', role: 'Frontend Dev' },
	{ id: '2', name: 'Minishell', completedDate: '2025-10-15', role: 'Input check and parsing' },
];

export const MOCK_FRIENDS: Friend[] = [
	{ id: '1', name: 'Osme', avatar: 'https://picsum.photos/id/65/50/50', status: 'online' },
	{ id: '2', name: 'Fabio', avatar: 'https://picsum.photos/id/66/50/50', status: 'offline' },
	{ id: '3', name: 'Giulia', avatar: 'https://picsum.photos/id/67/50/50', status: 'away' },
];