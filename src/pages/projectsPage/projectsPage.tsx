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

	const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({
		todo: true,
		'in-progress': true,
		review: true,
		done: true,
	});
	
	const toggleCategory = (category: string) => {
		setExpandedCategories(prev => ({
			...prev,
			[category]: !prev[category],
		}));
	};

	const [selectedCard, setSelectedCard] = React.useState<Projects | null>(null);
	const [isExpanding, setIsExpanding] = React.useState(false);
	const [cardPosition, setCardPosition] = React.useState({ top: 0, left: 0, width: 0, height: 0 });

	const handleCardClick = (project: Projects, e: React.MouseEvent<HTMLDivElement>) => {
		const cardRect = e.currentTarget.getBoundingClientRect();
		setCardPosition({
			top: cardRect.top,
			left: cardRect.left,
			width: cardRect.width,
			height: cardRect.height,
		});

		setSelectedCard(project);
		setTimeout(() => setIsExpanding(true), 10);
	};

	const handleClose = () => {
		setIsExpanding(false);
		setTimeout(() => setSelectedCard(null), 400);
	}

	return (
		<div className="projectsPage">
			<h1 style={{ width: '100%', marginLeft: '2vw' }}>Projects</h1>
			<div className="category">
				<p onClick={() => toggleCategory('todo')} style={{ cursor: 'pointer' }}>
					<span className="category-title">TO DO</span>
					<span className="category-count">
						({MOCK_PROJECTS.filter((project) => project.status === 'todo').length})
					</span>
					<span className="expandable-arrow">
						{expandedCategories['todo'] ? <FiChevronUp /> : <FiChevronDown />}
					</span>
				</p>
				<div className={`cards-container ${expandedCategories['todo'] ? 'expanded' : 'collapsed'}`}>
					{MOCK_PROJECTS
						.filter((project) => project.status === 'todo')
						.map((project) => (
							<div 
								key={project.id} 
								className="project-card"
								onClick={(e) => handleCardClick(project, e)}
							>
								<h3>{project.name}</h3>
								<p className="project-description">{project.description}</p>
							</div>
						))
					}
				</div>
			</div>
			<div className="category">
				<p onClick={() => toggleCategory('in-progress')} style={{ cursor: 'pointer' }}>
					<span className="category-title">IN PROGRESS</span>
					<span className="category-count">
						({MOCK_PROJECTS.filter((project) => project.status === 'in-progress').length})
					</span>
					<span className="expandable-arrow">
						{expandedCategories['in-progress'] ? <FiChevronUp /> : <FiChevronDown />}
					</span>
				</p>
				<div className={`cards-container ${expandedCategories['in-progress'] ? 'expanded' : 'collapsed'}`}>
					{MOCK_PROJECTS
						.filter((project) => project.status === 'in-progress')
						.map((project) => (
							<div
								key={project.id}
								className="project-card"
								onClick={(e) => handleCardClick(project, e)}
							>
								<h3>{project.name}</h3>
								<p className="project-description">{project.description}</p>
							</div>
						))
					}
				</div>
			</div>
			<div className="category">
				<p onClick={() => toggleCategory('review')} style={{ cursor: 'pointer' }}>
					<span className="category-title">CODE REVIEW</span>
					<span className="category-count">
						({MOCK_PROJECTS.filter((project) => project.status === 'review').length})
					</span>
					<span className="expandable-arrow">
						{expandedCategories['review'] ? <FiChevronUp /> : <FiChevronDown />}
					</span>
				</p>
				<div className={`cards-container ${expandedCategories['review'] ? 'expanded' : 'collapsed'}`}>
					{MOCK_PROJECTS
						.filter((project) => project.status === 'review')
						.map((project) => (
							<div
								key={project.id}
								className="project-card"
								onClick={(e) => handleCardClick(project, e)}
							>
								<h3>{project.name}</h3>
								<p className="project-description">{project.description}</p>
							</div>
						))
					}
				</div>
			</div>
			<div className="category">
				<p onClick={() => toggleCategory('done')} style={{ cursor: 'pointer' }}>
					<span className="category-title">DONE</span>
					<span className="category-count">
						({MOCK_PROJECTS.filter((project) => project.status === 'done').length})
					</span>
					<span className="expandable-arrow">
						{expandedCategories['done'] ? <FiChevronUp /> : <FiChevronDown />}
					</span>
				</p>
				<div className={`cards-container ${expandedCategories['done'] ? 'expanded' : 'collapsed'}`}>
					{MOCK_PROJECTS
						.filter((project) => project.status === 'done')
						.map((project) => (
							<div
								key={project.id}
								className="project-card"
								onClick={(e) => handleCardClick(project, e)}
							>
								<h3>{project.name}</h3>
								<p className="project-description">{project.description}</p>
							</div>
						))
					}
				</div>
			</div>
			{selectedCard && (
				<div className="project-detail-overlay" onClick={handleClose}>
					<div
						className={`project-detail ${isExpanding ? 'expanding' : ''}`}
						style={!isExpanding ? {
							top: cardPosition.top,
							left: cardPosition.left,
							width: cardPosition.width,
							height: cardPosition.height,
						} : undefined}
						onClick={(e) => e.stopPropagation()}
					>
						<h2>{selectedCard.name}</h2>
						<p>Owner: {selectedCard.owner}</p>
						<p>Description: {selectedCard.description}</p>
						<p>Role: {selectedCard.role}</p>
						<p>Started: {selectedCard.startDate}</p>
						<p>Target: {selectedCard.targetDate}</p>
						<p>Status: {selectedCard.status}</p>
						<button onClick={() => {
							setSelectedProject(selectedCard);
							setActivePage('dashboard');
							handleClose();
						}}>
							Set Active Project</button>
						<button onClick={handleClose}>Close</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProjectsPage;