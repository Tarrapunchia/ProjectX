import React from 'react';
import { MOCK_PROJECTS } from "../../data/mockData";
import "./projectPage.css";
import type { Projects } from '../../data/types';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ProjectsPage: React.FC = () => {
	return (
		<div className="projectsPage">
			<h1>Projects</h1>
			<div className="category"></div>
			<div className="category"></div>
			<div className="category"></div>
			<div className="category"></div>
		</div>
	);
};

export default ProjectsPage;