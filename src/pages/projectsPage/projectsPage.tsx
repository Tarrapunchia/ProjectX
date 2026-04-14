import React, { useEffect } from 'react';
import { MOCK_PROJECTS, MOCK_TASKS } from "../../data/mockData";
import type { Participation, ProjectInfo, ProjectTasks } from '../../data/types';
import Category from './category';
import ProgressBar from './progressBar';
import TaskCard from './taskCard';

const BE_HOSTNAME = 'http://localhost:5000'

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

	const [Participations, setParticipations] = React.useState<Participation[]>()
	const [ParticipationFetched, setParticipationFetched] = React.useState<boolean>(false)
	
	const toggleCategory = (category: ProjectInfo['status']) => {
		setExpandedCategories(prev => ({
			...prev,
			[category]: !prev[category],
		}));
	};

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(
					`${BE_HOSTNAME}/api/v1/users/activeUsersProjects`, {
						method: 'GET',
						headers: { "Content-Type": "application/json" },
						credentials: "include",
					}
				)
				if (res.ok) {
					const parts: Participation[] = await res.json()
					setParticipations(parts)
				}
				setParticipationFetched(true)
			} catch (error) {
				console.log(`Error in fetching user infos: ${error}`)
			}
		})()
	}, []);

	let projList: ProjectInfo[]
	let taskList: ProjectTasks[]
	if (ParticipationFetched) { 
		projList = Participations?.map((p) => p.project) ?? []
		taskList = []
	}
	else {
		projList = MOCK_PROJECTS
		taskList = MOCK_TASKS
	}

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
		<div className="flex gap-x-[1vw] gap-y-[20px] ml-[2vw] flex-wrap justify-start items-start content-start bg-bg-color min-h-screen">
			<h1 className="w-full ml-[2vw] text-[3.2em] font-bold leading-[1.1] my-8">Projects</h1>
			
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
				<div className="fixed inset-0 bg-black/50 z-[100]" onClick={handleClose}>
					<div
						className={`fixed grid grid-cols-[3fr_1fr] bg-overlay-bg-color p-[30px] rounded-[8px] transition-all duration-400 overflow-hidden 
							${isExpanding 
								? '!top-[10vh] !left-[16vw] !w-[83vw] !h-[85vh] opacity-100 border border-overlay-border-color' 
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
								<p className="line-clamp-1 min-w-[200px] max-w-[350px] mr-[20px] ml-auto bg-owner-color text-center rounded-[5px] text-[20px] px-2">
									Owner Infos
								</p>
							</div>
							
							<div className="line-clamp-6 break-all w-[98%] mt-[30px] ml-[10px] text-[20px] font-extralight">
								Description: {selectedCard.description}
							</div>

							<ProgressBar 
								projectId={selectedCard.id}
								createdAt={selectedCard.createdAt}
								closedAt={selectedCard.closedAt}
								showDetails
							/>

							<div className="flex justify-between mt-auto mb-[5px] w-full">
								<button 
									className="mt-[20px] py-[8px] px-[20px] cursor-pointer border border-white bg-transparent text-white rounded-[4px] mr-[50px] hover:bg-white/10 transition-colors"
									onClick={() => {
										setSelectedProject(selectedCard);
										setActivePage('dashboard');
										handleClose();
									}}
								>
									Set Active Project
								</button>
								<button 
									className="mt-[20px] py-[8px] px-[20px] cursor-pointer border border-white bg-transparent text-white rounded-[4px] mr-[50px] hover:bg-white/10 transition-colors"
									onClick={handleClose}
								>
									Close
								</button>
							</div>
						</div>
						<TaskCard projectID={selectedCard.id} taskList={selectedCard.tasks ?? taskList} />
					</div>
				</div>
			)}
		</div>
	);
};

export default ProjectsPage;