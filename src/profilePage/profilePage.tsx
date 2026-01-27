import React from 'react';
import type { ProfileUser, CompletedProject, Friend } from './types';

const MOCK_USER: ProfileUser = {
	id: '1',
	firstName: 'Manuel',
	lastName: 'Chiaramello',
	email: 'mchiaram@42Firenze.com',
	avatar: 'https://picsum.photos/id/64/150/150',
	description: 'WiP',
};

const MOCK_PROJECTS: CompletedProject[] = [
	{ id: '1', name: 'Website Aziendale', completedDate: '2025-12-01', role: 'Frontend Dev' },
	{ id: '2', name: 'App Mobile', completedDate: '2025-10-15', role: 'UI Designer' },
];

const MOCK_FRIENDS: Friend[] = [
	{ id: '1', name: 'Osme', avatar: 'https://picsum.photos/id/65/50/50', status: 'online' },
	{ id: '2', name: 'Fabio', avatar: 'https://picsum.photos/id/66/50/50', status: 'offline' },
	{ id: '3', name: 'Giulia', avatar: 'https://picsum.photos/id/67/50/50', status: 'away' },
];

const ProfilePage: React.FC = () => {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-slate-800">Pagina Profilo</h1>
			<p>Ciao, {MOCK_USER.firstName}!</p>
		</div>
	);
};

export default ProfilePage;