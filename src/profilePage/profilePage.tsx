import React from 'react';
import type { ProfileUser, CompletedProject, Friend } from './types';
import './profilePage.css'

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
		<div className="profile-container">
			<div className="profile-header">
				<img src={MOCK_USER.avatar} alt="Foto profilo" className="profile-avatar"/>
				<div className="profile-info">
					<h1>{MOCK_USER.firstName} {MOCK_USER.lastName}</h1>
					<p className="email">{MOCK_USER.email}</p>
					<p className="description">{MOCK_USER.description}</p>
				</div>
			</div>
			<div className="section">
				<h2>Completed Projects</h2>
				{MOCK_PROJECTS.map((project) => (
					<div key={project.id} className="project-card">
						<h3>{project.name}</h3>
						<p>Role: {project.role}</p>
						<p>Completed: {project.completedDate}</p>
					</div>
				))}
			</div>
			<div className="section">
				<h2>Friends</h2>
				<div className="friends-list">
					{MOCK_FRIENDS.map((friend) => (
						<div key={friend.id} className={`friend-card ${friend.status}`}>
							<img src={friend.avatar} alt={friend.name} className="friend-avatar" />
							<span>{friend.name}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;