import React, { useEffect, useState } from 'react';
import { MOCK_USER, MOCK_PROJECTS, MOCK_FRIENDS, AVATAR } from '../../data/mockData';
import './profilePage.css'
import Helpers from './helpers';
import { type userInfos } from '../../data/types';

const ProfilePage: React.FC = () => {
	const [userInfo, setUserInfo] = useState<userInfos>(MOCK_USER)

	useEffect(() => {
		(async () => {
			const data = await Helpers.getUserInfos()
			if (data.success) {
				setUserInfo(data.usr)
			}
		})()
		return () => {};
	}, []);
	return (
		<div className="profile-container">
			<div className="profile-header">
				<img src={AVATAR} alt="Foto profilo" className="profile-avatar"/>
				<div className="profile-info">
					<h1>{userInfo?.name} {userInfo?.surname}</h1>
					<div className="profile-details">
						<p className="email">Email: {userInfo?.email}</p>
						<p>Phone number: {userInfo?.phone}</p>
						<p className="description">Description: {userInfo?.jobQualifier}</p>
					</div>
				</div>
			</div>
			<div className="section">
				<h2>Projects</h2>
				<div className="project-list">
					{/* {MOCK_PROJECTS.map((project) => (
						<div key={project.id} className={`project-card ${(project.status === 'COMPLETED') ? 'completed' : 'in-progress'}`}>
							<h3>{project.name}</h3>
							<p>Role: {project.description}</p>
							<p>Started: {project.createdAt.toUTCString()}</p>
							<p>Status: {project.status}</p>
							{project.status === 'COMPLETED' && <p>Completed: {project.closedAt?.toUTCString()}</p>}
						</div>
					))} */}
					{userInfo.projects.map((project) => (
						<div key={project.id} className={`project-card ${(project.status === 'COMPLETED') ? 'completed' : 'in-progress'}`}>
							<h3>{project.name}</h3>
							<h4>Description: {project.description}</h4>
							<p>Role: {project.role}</p>
							<p>Started: {new Date(project.createdAt as any).toUTCString()}</p>
							<p>Joined: {new Date(project.joinedAt as any).toUTCString()}</p>
							<p>Status: {project.status}</p>
							{project.status === 'COMPLETED' && <p>Completed: {project.closedAt?.toUTCString()}</p>}
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