import React from 'react';
import { MOCK_PROJECTS } from "../../data/mockData";
import "./projectPage.css";
import type { Projects } from '../../data/types';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface ProjectsPageProps {
	setActivePage: (page: string) => void;
	setSelectedProject: (project: Projects) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ setActivePage, setSelectedProject }) => {

	const handleProjectClick = (project: Projects) => {
		setSelectedProject(project);
		setActivePage('dashboard');
	};

	const [showInProgress, setShowInProgress] = React.useState(true);
	const [showCompleted, setShowCompleted] = React.useState(true);
	const [expandedProjectId, setExpandedProjectId] = React.useState<string | null>(null);

	const handleCardClick = (projectId: string) => {
		setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
	};

	return (
		<div className="projects-container">
			<div className="expandable-div">
				<h2 onClick={() => setShowInProgress(v => !v)} style={{ cursor: 'pointer' }}>In Progress</h2>
				<span className="arrow-span">
				 	{ showInProgress ? <FiChevronUp /> : <FiChevronDown /> }
				</span>
			</div>
			<div className={`in-progress ${showInProgress ? 'expanded' : 'collapsed'}`}>
				{MOCK_PROJECTS
				.filter((project) => !project.completed)
				.map((project) => (
					<div 
							key={project.id}
							className={`project-card in-progress${expandedProjectId === project.id ? ' expanded' : ''}`}
							onClick={() => handleCardClick(project.id)}
							style={{ cursor: 'pointer'}}
					>
						<h3>{project.name}</h3>
						<div className="expandable-content">
							<div style={{ opacity: expandedProjectId === project.id ? 1 : 0, transition: 'opacity 0.3s' }}>
								<p>Leader: {project.leader}</p>
								<p>Role: {project.role}</p>
								<p>Started: {project.startDate}</p>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="expandable-div">
				<h2 onClick={() => setShowCompleted(v => !v)} style={{ cursor: 'pointer' }}>Completed</h2>
				<span className="arrow-span">
					 { showCompleted ? <FiChevronUp /> : <FiChevronDown /> }
				</span>
			</div>
			<div className={`completed ${showCompleted ? 'expanded' : 'collapsed'}`}>
				{MOCK_PROJECTS
				.filter((project) => project.completed)
				.map((project) => (
					<div key={project.id}
						className={`project-card${expandedProjectId === project.id ? ' expanded' : ''} completed`}
						onClick={() => handleCardClick(project.id)}
						style={{ cursor: 'pointer'}}
					>
						<h3>{project.name}</h3>
						<div className="expandable-content">
							<div style={{ opacity: expandedProjectId === project.id ? 1 : 0, transition: 'opacity 0.3s' }}>
								<p>Leader: {project.leader}</p>
								<p>Role: {project.role}</p>
								<p>Started: {project.startDate}</p>
								<p>Completed: {project.completedDate}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ProjectsPage;