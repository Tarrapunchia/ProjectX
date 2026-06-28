import React from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ProgressBar from './progressBar';
import type { ProjectInfo } from '../../data/types';

interface CategoryProps {
	label: string;
	status: ProjectInfo['status'];
	projList: ProjectInfo[];
	isExpanded: boolean;
	onToggle: () => void;
	onCardClick: (project: ProjectInfo, e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function Category({ label, status, projList, isExpanded, onToggle, onCardClick } : CategoryProps) {
	const filtered = projList.filter((p) => p.status === status);

	return (
		<div className="min-w-[320px] w-[19vw] bg-category-bg-color rounded-[2px]">
			<p onClick={onToggle} className="flex items-center cursor-pointer min-h-[40px]">
				<span className="inline-block ml-[1.5%] font-medium">{label}</span>
				<span className="ml-[5px] font-extralight">({filtered.length})</span>
				<span className="ml-auto mr-[10px]">
					{isExpanded ? <FiChevronUp /> : <FiChevronDown />}
				</span>
			</p>
			<div className={`cards-container ${isExpanded ? 'expanded' : 'collapsed' }`}>
				<div className="overflow-hidden">
					{filtered.map((project) => (
						<div key={project.id} className="flex flex-col bg-bg-color h-[250px] w-[98%] mx-auto mb-[6px] rounded-[2px]" onClick={(e) => onCardClick(project, e)}>
							<h3 className="text-[25px]">{project.name}</h3>
							<p className="line-clamp-2 break-words font-light">{project.description}</p>
							<ProgressBar projectId={project.id} createdAt={project.createdAt} closedAt={project.closedAt} />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}