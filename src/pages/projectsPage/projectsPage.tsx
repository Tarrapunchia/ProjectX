import React from 'react';
import { MOCK_PROJECTS } from "../../data/mockData";
import "./projectPage.css";
import type { Projects } from '../../data/types';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ProjectsPage: React.FC = () => {
	return (
		<div className="projectsPage">
			<h1 style={{ width: '100%' }}>Projects</h1>
			<div className="category">
				<p className="category-text">{`TO DO`}</p>
				<div className="project-card"></div>
			</div>
			<div className="category">
				<p className="category-text">{`IN PROGRESS`}</p>
				<div className="project-card"></div>
			</div>
			<div className="category">
				<p className="category-text">{`CODE REVIEW`}</p>
				<div className="project-card"></div>
			</div>
			<div className="category">
				<p className="category-text">{`DONE`}</p>
				<div className="project-card"></div>
			</div>
		</div>
	);
};

export default ProjectsPage;