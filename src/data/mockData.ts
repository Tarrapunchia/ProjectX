import consts from './consts';
import type { ProfileUser, Projects, Friend, ProjectInfo, ProjectTasks, userInfos, FriendList } from './types';

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
	avatar: `https://picsum.photos/id/64/150/150`,
	isLoggedIn: true,
	createdAt: new Date,
	updatedAt: new Date,
	organizations: [],
	projects: []
}

export const MOCK_PROJECTS: ProjectInfo[] = [
	{ id: '1', name: 'Trascendence', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10'), tasks: [] },
	{ id: '2', name: 'Trascendence2', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10'), tasks: [] },
	{ id: '3', name: 'Trascendenceeeee3', status: 'TODO',
		description: 'really long description test AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
		createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10'), tasks: [] },
	{ id: '4', name: 'Trascendence4', status: 'TODO', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2025-12-10'), tasks: [] },
	{ id: '5', name: 'Trascendence5', status: 'TODO', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: null, tasks: [] },
	{ id: '6', name: 'Trascendence6', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10'), tasks: [] },
	{ id: '7', name: 'Trascendence7', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10'), tasks: [] },
	{ id: '8', name: 'Trascendence8', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10'), tasks: [] },
	{ id: '9', name: 'Trascendence9', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10'), tasks: [] },
	{ id: '10', name: 'Trascendence10', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10'), tasks: [] },
	{ id: '11', name: 'Trascendence11', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10'), tasks: [] },
	{ id: '12', name: 'Trascendence12', status: 'ACTIVE', description: 'description test', createdAt: new Date('2025-08-15'), closedAt: new Date('2026-12-10'), tasks: [] },

];

export const MOCK_TASKS: ProjectTasks[] = [
	{id: '3-0', projectId: '3', name: 'task0', status: 'ACTIVE', description: 'long task description AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', createdAt: new Date('2025-08-15'), priority: "HIGH", dueDate: new Date('2026-10-15'), closedAt: null},
	{id: '3-1', projectId: '3', name: 'task1', status: 'COMPLETED', description: 'task description', createdAt: new Date('2025-08-15'), priority: "HIGH", dueDate: new Date('2026-4-15'), closedAt: null},
	{id: '3-2', projectId: '3', name: 'task2', status: 'COMPLETED', description: 'task description', createdAt: new Date('2025-08-15'), priority: "HIGH", dueDate: new Date('2026-3-15'), closedAt: null},
	{id: '3-3', projectId: '3', name: 'task3', status: 'ACTIVE', description: 'task description', createdAt: new Date('2025-08-15'), priority: "HIGH", dueDate: new Date('2026-12-15'), closedAt: null},
	{id: '3-4', projectId: '3', name: 'task4', status: 'ACTIVE', description: 'task description', createdAt: new Date('2025-08-15'), priority: "HIGH", dueDate: new Date('2026-9-15'), closedAt: null},
	{id: '4-0', projectId: '4', name: 'task4', status: 'COMPLETED', description: 'task description', createdAt: new Date('2025-08-15'), priority: "HIGH", dueDate: new Date('2026-7-15'), closedAt: null},
];

export const MOCK_FRIENDSS: Friend[] = [
	{ id: '1', name: 'Osme', surname: 'Fantozzi', email: 'mail@mail.mail', avatar: 'https://picsum.photos/id/65/50/50', isLoggedIn: true },
	{ id: '2', name: 'Fabio', surname: 'Fantozzi', email: 'mail@mail.mail', avatar: 'https://picsum.photos/id/66/50/50', isLoggedIn: false },
	{ id: '3', name: 'Giulia', surname: 'Fantozzi', email: 'mail@mail.mail', avatar: 'https://picsum.photos/id/67/50/50', isLoggedIn: true },
];

export const MOCK_FRIENDS: FriendList = {
	count: 3,
	friends: [
		{ id: '1', name: 'Osme', surname: 'Fantozzi', email: 'mail@mail.mail', avatar: 'https://picsum.photos/id/65/50/50', isLoggedIn: true },
		{ id: '2', name: 'Fabio', surname: 'Fantozzi', email: 'mail@mail.mail', avatar: 'https://picsum.photos/id/66/50/50', isLoggedIn: false },
		{ id: '3', name: 'Giulia', surname: 'Fantozzi', email: 'mail@mail.mail', avatar: 'https://picsum.photos/id/67/50/50', isLoggedIn: true },
	]
} 