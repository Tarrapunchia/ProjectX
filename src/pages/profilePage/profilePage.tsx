import React from 'react';
import { MOCK_USER, MOCK_PROJECTS, MOCK_FRIENDS } from '../../data/mockData';
import './profilePage.css'

const ProfilePage: React.FC = () => {
	return (
		<div className="profile-container">
			<div className="profile-header">
				<img src={MOCK_USER.avatar} alt="Foto profilo" className="profile-avatar"/>
				<div className="profile-info">
					<h1>{MOCK_USER.firstName} {MOCK_USER.lastName}</h1>
					<div className="profile-details">
						<p className="email">Email: {MOCK_USER.email}</p>
						<p>Phone number: {MOCK_USER.phoneNumber}</p>
						<p className="description">Description: {MOCK_USER.description}</p>
					</div>
				</div>
			</div>
			<div className="section">
				<h2>Projects</h2>
				<div className="project-list">
					{MOCK_PROJECTS.map((project) => (
						<div key={project.id} className={`project-card ${project.completed ? 'completed' : 'in-progress'}`}>
							<h3>{project.name}</h3>
							<p>Leader: {project.owner}</p>
							<p>Role: {project.role}</p>
							<p>Started: {project.startDate}</p>
							{project.completed && <p>Completed: {project.completedDate}</p>}
						</div>
					))}
				</div>
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