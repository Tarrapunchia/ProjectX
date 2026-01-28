import React from 'react';
import { MOCK_PROJECTS } from "../../data/mockData";
import "./projectPage.css";
import type { Projects } from '../../data/types';

interface ProjectsPageProps {
	setActivePage: (page: string) => void;
	setSelectedProject: (project: Projects) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ setActivePage, setSelectedProject }) => {

	const handleProjectClick = (project: Projects) => {
		setSelectedProject(project);
		setActivePage('dashboard');
	};

	return (
		<div className="projects-container">
			<h2>In progress</h2>
			<div className="in-progress">
				{MOCK_PROJECTS
				.filter((project) => !project.completed)
				.map((project) => (
					<div 
						key={project.id}
						className="project-card in-progress"
						onClick={() => handleProjectClick(project)}
						style={{ cursor: 'pointer'}}
					>
						<h3>{project.name}</h3>
						<p>Leader: {project.leader}</p>
						<p>Role: {project.role}</p>
						<p>Started: {project.startDate}</p>
					</div>
				))}
			</div>
			<div className="completed">
				<h2>Completed</h2>
				{MOCK_PROJECTS
				.filter((project) => project.completed)
				.map((project) => (
					<div key={project.id}
					className="project-card completed"
					onClick={() => handleProjectClick(project)}
					style={{ cursor: 'pointer'}}
					>
						<h3>{project.name}</h3>
						<p>Leader: {project.leader}</p>
						<p>Role: {project.role}</p>
						<p>Started: {project.startDate}</p>
						<p>Completed: {project.completedDate}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default ProjectsPage;