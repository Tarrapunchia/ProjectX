import React, { useEffect, useState } from 'react';
import { MOCK_PROJECTS, MOCK_TASKS } from "../../data/mockData";
import "./projectPage.css";
import type { Projects, Organization } from '../../data/types';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ProgressBar from './progressBar';
// import helpers from './helpers';

// per ora forzo orgId = 2
const orgId = 2

const BE_HOSTNAME = 'https://localhost:5000'
type ProjectInfo = {
	id: string,
	name: string,
	status: 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'TODO',
	description: string,
	createdAt: Date,
	closedAt: Date | null
}

interface ProjectsPageProps {
	setActivePage: (page: string) => void;
	setSelectedProject: (project: ProjectInfo) => void;
}


const ProjectsPage: React.FC<ProjectsPageProps> = ({ setActivePage, setSelectedProject }) => {

	const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({
		TODO: false,
		ACTIVE: false,
		REVIEW: false,
		COMPLETED: false,
	});

	const [orgInfo, setOrgInfo] = React.useState<Organization>()
	const [orgFetched, setOrgFetched] = React.useState<boolean>(false)
	
	const toggleCategory = (category: ProjectInfo['status']) => {
		setExpandedCategories(prev => ({
			...prev,
			[category]: !prev[category],
		}));
	};

	// per ora forzo orgId = 1
	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(
					`${BE_HOSTNAME}/api/v1/organizations/${orgId}/organization`, {
						method: 'GET',
						headers: { "Content-Type": "application/json" },
						credentials: "include",
					}
				)
				if (res.ok) {
					const org = await res.json()
					setOrgInfo(org)
				}
				setOrgFetched(true)
			} catch (error) {
				console.log(`Error in fetching org ${orgId} infos`)
			}
		})()
		return () => {  };
	}, []);

	let projList: ProjectInfo[]
	if (orgFetched) { projList = orgInfo?.projects ?? [] }
	else { projList = MOCK_PROJECTS}

	const [selectedCard, setSelectedCard] = React.useState<ProjectInfo | null>(null);
	const [isExpanding, setIsExpanding] = React.useState(false);
	const [cardPosition, setCardPosition] = React.useState({ top: 0, left: 0, width: 0, height: 0 });

	const handleCardClick = (project: ProjectInfo, e: React.MouseEvent<HTMLDivElement>) => {
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
				<p onClick={() => toggleCategory('TODO')} style={{ cursor: 'pointer' }}>
					<span className="category-title">TO DO</span>
					<span className="category-count">
						({projList.filter((project) => project.status === 'TODO').length})
					</span>
					<span className="expandable-arrow">
						{expandedCategories['TODO'] ? <FiChevronUp /> : <FiChevronDown />}
					</span>
				</p>
				<div className={`cards-container ${expandedCategories['TODO'] ? 'expanded' : 'collapsed'}`}>
					<div className="cards-inner">
						{projList
							.filter((project) => project.status === 'TODO')
							.map((project) => (
								<div 
									key={project.id} 
									className="project-card"
									onClick={(e) => handleCardClick(project, e)}
								>
									<h3>{project.name}</h3>
									<p className="project-description">{project.description}</p>
									<ProgressBar projectId={project.id} createdAt={project.createdAt} closedAt={project.closedAt} />
								</div>
							))
						}
					</div>
				</div>
			</div>
			<div className="category">
				<p onClick={() => toggleCategory('ACTIVE')} style={{ cursor: 'pointer' }}>
					<span className="category-title">IN PROGRESS</span>
					<span className="category-count">
						({projList.filter((project) => project.status === 'ACTIVE').length})
					</span>
					<span className="expandable-arrow">
						{expandedCategories['ACTIVE'] ? <FiChevronUp /> : <FiChevronDown />}
					</span>
				</p>
				<div className={`cards-container ${expandedCategories['ACTIVE'] ? 'expanded' : 'collapsed'}`}>
					<div className="cards-inner">
						{projList
							.filter((project) => project.status === 'ACTIVE')
							.map((project) => (
								<div
									key={project.id}
									className="project-card"
									onClick={(e) => handleCardClick(project, e)}
								>
									<h3>{project.name}</h3>
									<p className="project-description">{project.description}</p>
									<ProgressBar projectId={project.id} createdAt={project.createdAt} closedAt={project.closedAt} />
								</div>
							))
						}
					</div>
				</div>
			</div>
			<div className="category">
				<p onClick={() => toggleCategory('REVIEW')} style={{ cursor: 'pointer' }}>
					<span className="category-title">CODE REVIEW</span>
					<span className="category-count">
						({projList.filter((project) => project.status === 'REVIEW').length})
					</span>
					<span className="expandable-arrow">
						{expandedCategories['REVIEW'] ? <FiChevronUp /> : <FiChevronDown />}
					</span>
				</p>
				<div className={`cards-container ${expandedCategories['REVIEW'] ? 'expanded' : 'collapsed'}`}>
					<div className="cards-inner">
						{projList
							.filter((project) => project.status === 'REVIEW')
							.map((project) => (
								<div
									key={project.id}
									className="project-card"
									onClick={(e) => handleCardClick(project, e)}
								>
									<h3>{project.name}</h3>
									<p className="project-description">{project.description}</p>
									<ProgressBar projectId={project.id} createdAt={project.createdAt} closedAt={project.closedAt} />
								</div>
							))
						}
					</div>
				</div>
			</div>
			<div className="category">
				<p onClick={() => toggleCategory('COMPLETED')} style={{ cursor: 'pointer' }}>
					<span className="category-title">DONE</span>
					<span className="category-count">
						({projList.filter((project) => project.status === 'COMPLETED').length})
					</span>
					<span className="expandable-arrow">
						{expandedCategories['DONE'] ? <FiChevronUp /> : <FiChevronDown />}
					</span>
				</p>
				<div className={`cards-container ${expandedCategories['DONE'] ? 'expanded' : 'collapsed'}`}>
					<div className="cards-inner">
						{projList
							.filter((project) => project.status === 'COMPLETED')
							.map((project) => (
								<div
									key={project.id}
									className="project-card"
									onClick={(e) => handleCardClick(project, e)}
								>
									<h3>{project.name}</h3>
									<p className="project-description">{project.description}</p>
									<ProgressBar projectId={project.id} createdAt={project.createdAt} closedAt={project.closedAt} />
								</div>
							))
						}
					</div>
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
						<div className="project-info">
							<div className="title-owner-row">
								<h2>{selectedCard.name}</h2>
								<p className="owner-info">{orgInfo?.name ?? 'Err'}</p>
							</div>
							<div className="description-row">Description: {selectedCard.description}</div>
							{/* <p>Status: {selectedCard.status}</p> */}
							<ProgressBar 
								projectId={selectedCard.id}
								createdAt={selectedCard.createdAt}
								closedAt={selectedCard.closedAt}
								showDetails
							/>
							<div className="overlay-btn">
								<button onClick={() => {
									setSelectedProject(selectedCard);
									setActivePage('dashboard');
									handleClose();
								}}>
									Set Active Project</button>
								<button onClick={handleClose}>Close</button>
							</div>
						</div>
						<div className="tasks-info">
							<h3>Tasks</h3>
							{MOCK_TASKS
								.filter((task) => task.projectId === selectedCard.id)
								.map((task) => (
									<div key={task.id} className="task-card">
										<h3>{task.name}</h3>
										<p>{task.description}</p>
										<p>Created At: {new Date(task.createdAt).toLocaleDateString('it-IT')}</p>
										<p>Due: {task.dueDate
											? new Date(task.dueDate).toLocaleDateString('it-IT')
											: 'N/A'}
										</p>
										<p>Status: {task.status}</p>
									</div>
								))
							}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProjectsPage;