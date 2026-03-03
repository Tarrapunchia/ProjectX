import type { ProfileUser, Projects, Friend, ProjectInfo, userInfos } from './types';

// export const MOCK_USER: ProfileUser = {
// 	id: '1',
// 	firstName: 'Manuel',
// 	lastName: 'Chiaramello',
// 	email: 'mchiaram@42firenze.com',
// 	phoneNumber: '3312543322',
// 	avatar: 'https://picsum.photos/id/64/150/150',
// 	description: 'WiP',
// }

export const AVATAR = 'https://picsum.photos/id/64/150/150'

export const MOCK_USER: userInfos = {
	id: '1',
	name: 'Manuel',
	surname: 'Chiaramello',
	email: 'mchiaram@42firenze.com',
	phone: '3312543322',
	city: 'Florence',
	cap: '',
	state: 'Italy',
	address: 'Via del Tiratoio 1',
	jobQualifier: 'Developer',
	isLoggedIn: true,
	createdAt: new Date,
	updatedAt: new Date,
	organizations: [

	],
	projects: []
}

// export const MOCK_PROJECTS: Projects[] = [
// 	{ id: '1', owner: 'Space Travel Partner Name Too Long Test', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'todo' },
// 	{ id: '2', owner: 'Piero', name: 'Trascendence', description: 'If the description length is more than two line the text gets cutted off and three points are shown instead This is some hidden text', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'in-progress' },
// 	{ id: '3', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'in-progress' },
// 	{ id: '4', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'todo' },
// 	{ id: '5', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'review' },
// 	{ id: '6', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'in-progress' },
// 	{ id: '7', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'review' },
// 	{ id: '8', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'todo' },
// 	{ id: '9', owner: 'Piero', name: 'Trascendence', description: 'description test', startDate: '2025-08-15', targetDate: '2026-12-10', completed: false, completedDate: 'TBD', role: 'Frontend Dev', status: 'todo' },
// 	{ id: '10', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
// 	{ id: '11', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
// 	{ id: '12', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
// 	{ id: '13', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
// 	{ id: '14', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
// 	{ id: '15', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
// 	{ id: '16', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
// 	{ id: '17', owner: 'Paolo', name: 'Minishell', description: 'description test', startDate:'2025-05-04', targetDate: '2026-12-10', completed: true, completedDate: '2025-10-15', role: 'Input check and parsing', status: 'done' },
// ];

export const MOCK_PROJECTS: ProjectInfo[] = [
	{ id: '1', name: 'Trascendence', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '2', name: 'Trascendence2', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '3', name: 'Trascendence3', status: 'TODO', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '4', name: 'Trascendence4', status: 'TODO', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '5', name: 'Trascendence5', status: 'TODO', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '6', name: 'Trascendence6', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '7', name: 'Trascendence7', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '8', name: 'Trascendence8', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '9', name: 'Trascendence9', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '10', name: 'Trascendence10', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '11', name: 'Trascendence11', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },
	{ id: '12', name: 'Trascendence12', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10') },

];

export const MOCK_FRIENDS: Friend[] = [
	{ id: '1', name: 'Osme', avatar: 'https://picsum.photos/id/65/50/50', status: 'online' },
	{ id: '2', name: 'Fabio', avatar: 'https://picsum.photos/id/66/50/50', status: 'offline' },
	{ id: '3', name: 'Giulia', avatar: 'https://picsum.photos/id/67/50/50', status: 'away' },
];