import React, { useEffect } from 'react';
import { MOCK_PROJECTS, MOCK_TASKS } from "../../data/mockData";
import "./projectPage.css";
import type { Organization, ProjectInfo, ProjectTasks } from '../../data/types';
import Category from './category';
import ProgressBar from './progressBar';
import TaskCard from './taskCard';
// import helpers from './helpers';
import consts from '../../data/consts';

// per ora forzo orgId = 2
const orgId = 2

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
					`${consts.BE}/api/v1/organizations/${orgId}/organization`, {
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
				console.error(`Error in fetching org ${orgId} infos`)
			}
		})()
		return () => {  };
	}, []);

	let projList: ProjectInfo[]
	if (orgFetched) { projList = orgInfo?.projects ?? [] }
	else { projList = MOCK_PROJECTS}

	let taskList: ProjectTasks[]
	taskList = MOCK_TASKS

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
			<Category label="TO DO" status="TODO" projList={projList}
				isExpanded={expandedCategories['TODO']}
				onToggle={() => toggleCategory('TODO')}
				onCardClick={handleCardClick}
			/>
			<Category label="IN PROGRESS" status="ACTIVE" projList={projList}
				isExpanded={expandedCategories['ACTIVE']}
				onToggle={() => toggleCategory('ACTIVE')}
				onCardClick={handleCardClick}
			/>
			<Category label="CODE REVIEW" status="REVIEW" projList={projList}
				isExpanded={expandedCategories['REVIEW']}
				onToggle={() => toggleCategory('REVIEW')}
				onCardClick={handleCardClick}
			/>
			<Category label="DONE" status="COMPLETED" projList={projList}
				isExpanded={expandedCategories['COMPLETED']}
				onToggle={() => toggleCategory('COMPLETED')}
				onCardClick={handleCardClick}
			/>
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
						<TaskCard projectID={selectedCard.id} taskList={taskList} />
					</div>
				</div>
			)}
		</div>
	);
};

export default ProjectsPage;