import React, { useState } from 'react';
// import { MOCK_PROJECTS, MOCK_TASKS } from "../../data/mockData";
import type { Participation, ProjectInfo, ProjectTasks } from '../../data/types';
import Category from './category';
import ProgressBar from './progressBar';
import TaskCard from './taskCard';
import { CreateProject } from './createProject';
import { useWebSocket, type ProjectDetailed } from '../../utilities/WebSocketContext';

const BE_HOSTNAME = 'http://localhost:5000'

interface ProjectsPageProps {
	setActivePage: (page: string) => void;
	setSelectedProject: (project: ProjectDetailed) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ setActivePage, setSelectedProject }) => {
	const { projects, setProjects, activeOrg } = useWebSocket();
	const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
		TODO: false,
		ACTIVE: false,
		REVIEW: false,
		COMPLETED: false,
	});

	// const [Participations, setParticipations] = React.useState<Participation[]>()
	// const [ParticipationFetched, setParticipationFetched] = React.useState<boolean>(false)
	
	const toggleCategory = (category: ProjectDetailed['status']) => {
		setExpandedCategories(prev => ({
			...prev,
			[category]: !prev[category],
		}));
	};

	// useEffect(() => {
	// 	(async () => {
	// 		try {
	// 			const res = await fetch(
	// 				`${BE_HOSTNAME}/api/v1/users/activeUsersProjects`, {
	// 					method: 'GET',
	// 					headers: { "Content-Type": "application/json" },
	// 					credentials: "include",
	// 				}
	// 			)
	// 			if (res.ok) {
	// 				const parts: Participation[] = await res.json()
	// 				setParticipations(parts)
	// 			}
	// 			setParticipationFetched(true)
	// 		} catch (error) {
	// 			console.log(`Error in fetching user infos: ${error}`)
	// 		}
	// 	})()
	// }, []);

	// let projList: ProjectInfo[]
	// let taskList: ProjectTasks[]
	// if (ParticipationFetched) { 
	// 	projList = Participations?.map((p) => p.project) ?? []
	// 	taskList = []
	// }
	// else {
	// 	projList = MOCK_PROJECTS
	// 	taskList = MOCK_TASKS
	// }

	const [selectedCard, setSelectedCard] = useState<ProjectDetailed | null>(null);
	const [isExpanding, setIsExpanding] = useState(false);
	const [cardPosition, setCardPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
	const [createProject, setCreateProject] = useState(false);
	
	const handleCardClick = (project: ProjectDetailed, e: React.MouseEvent<HTMLDivElement>) => {
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
		<div className="flex no-scrollbar overflow-y-auto gap-x-[1vw] gap-y-5 ml-[2vw] flex-wrap justify-start items-start content-start bg-bg-color">
			<div className="flex flex-between w-full items-center">
				<h1 className="w-full ml-[2vw] text-[3.2em] font-bold leading-[1.1] my-8">Projects</h1>
				{activeOrg && (
					<button
						onClick={() => setCreateProject(true)}
						className="flex items-center justify-center text-lg p-8 mr-[8%] border rounded-md border-overlay-border-color h-15 transition-all duration-300 hover:border-owner-color hover:scale-110 active:scale-90">
						Crea nuovo progetto
					</button>
				)}
			</div>
			<div className="flex flex-wrap gap-8">
				<Category label="TO DO" status="TODO" projList={projects}
					isExpanded={expandedCategories['TODO']}
					onToggle={() => toggleCategory('TODO')}
					onCardClick={handleCardClick}
				/>
				<Category label="IN PROGRESS" status="ACTIVE" projList={projects}
					isExpanded={expandedCategories['ACTIVE']}
					onToggle={() => toggleCategory('ACTIVE')}
					onCardClick={handleCardClick}
				/>
				<Category label="CODE REVIEW" status="REVIEW" projList={projects}
					isExpanded={expandedCategories['REVIEW']}
					onToggle={() => toggleCategory('REVIEW')}
					onCardClick={handleCardClick}
				/>
				<Category label="DONE" status="COMPLETED" projList={projects}
					isExpanded={expandedCategories['COMPLETED']}
					onToggle={() => toggleCategory('COMPLETED')}
					onCardClick={handleCardClick}
				/>
			</div>

			{selectedCard && (
				<div className="fixed inset-0 bg-black/50 z-100" onClick={handleClose}>
					<div
						className={`fixed grid grid-cols-[3fr_1fr] bg-overlay-bg-color p-7.5 rounded-lg transition-all duration-400 overflow-hidden 
							${isExpanding 
								? 'top-[10vh]! left-[16vw]! w-[83vw]! h-[85vh]! opacity-100 border border-overlay-border-color' 
								: 'opacity-0'
							}`}
						style={!isExpanding ? {
							top: cardPosition.top,
							left: cardPosition.left,
							width: cardPosition.width,
							height: cardPosition.height,
						} : undefined}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex flex-col items-start border-r border-overlay-border-color h-full pr-4">
							<div className="flex flex-wrap items-center w-full">
								<h2 className="text-[50px] font-bold m-0 leading-tight">{selectedCard.name}</h2>
								<p className="line-clamp-1 min-w-50 max-w-87.5 mr-5 ml-auto bg-owner-color text-center rounded-[5px] text-[20px] px-2">
									Owner Infos
								</p>
							</div>
							
							<div className="line-clamp-6 break-all w-[98%] mt-7.5 ml-2.5 text-[20px] font-extralight">
								Description: {selectedCard.description}
							</div>

							<ProgressBar 
								projectId={String(selectedCard.id)}
								createdAt={selectedCard.createdAt}
								closedAt={selectedCard.closedAt}
								showDetails
							/>

							<div className="flex justify-between mt-auto mb-1.25 w-full">
								<button 
									className="mt-5 py-2 px-5 cursor-pointer border border-white bg-transparent text-white rounded-sm mr-12.5 hover:bg-white/10 transition-colors"
									onClick={() => {
										setSelectedProject(selectedCard);
										setActivePage('dashboard');
										handleClose();
									}}
								>
									Set Active Project
								</button>
								<button 
									className="mt-5 py-2 px-5 cursor-pointer border border-white bg-transparent text-white rounded-sm mr-12.5 hover:bg-white/10 transition-colors"
									onClick={handleClose}
								>
									Close
								</button>
							</div>
						</div>
						<TaskCard projectID={Number(selectedCard.id)} taskList={selectedCard.tasks ?? []} />
					</div>
				</div>
			)}
			{createProject && (
				<CreateProject
					setCreateProject={setCreateProject}
				/>
			)}
		</div>
	);
};

export default ProjectsPage;