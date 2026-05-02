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
		<div className="min-w-[320px] w-[19vw] bg-category-bg-color rounded-t-xl rounded-b-xs">
			<p onClick={onToggle} className="flex text-[20px] items-center cursor-pointer w-[98%] min-h-[40px] bg-bg-color rounded-t-xl rounded-b-xs ml-[1%] mt-1 mb-1">
				<span className="inline-block ml-5 font-medium text-text-category">{label}</span>
				<span className="ml-[5px] font-extralight">({filtered.length})</span>
				<span className="ml-auto mr-[10px] text-text-category">
					{isExpanded ? <FiChevronUp /> : <FiChevronDown />}
				</span>
			</p>
			<div className={`grid transition-[grid-template-rows,opacity] duration-400 ease-in-out 
				${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
			>
				<div className="overflow-hidden">
					{filtered.map((project) => (
						<div key={project.id} className="flex flex-col bg-side-bg-color h-[250px] w-[98%] mx-auto mb-[6px] rounded-[2px]" onClick={(e) => onCardClick(project, e)}>
							<h3 className="text-[20px] ml-1">{project.name}</h3>
							<p className="text-[16px] ml-1 line-clamp-2 break-words font-light">{project.description}</p>
							<ProgressBar projectId={project.id} createdAt={project.createdAt} closedAt={project.closedAt} />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}