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
		<div className="category">
			<p onClick={onToggle} style={{ cursor: 'pointer' }}>
				<span className="category-title">{label}</span>
				<span className="category-count">({filtered.length})</span>
				<span className="expandable-arrow">
					{isExpanded ? <FiChevronUp /> : <FiChevronDown />}
				</span>
			</p>
			<div className={`cards-container ${isExpanded ? 'expanded' : 'collapsed' }`}>
				<div className="cards-inner">
					{filtered.map((project) => (
						<div key={project.id} className="project-card" onClick={(e) => onCardClick(project, e)}>
							<h3>{project.name}</h3>
							<p className="project-description">{project.description}</p>
							<ProgressBar projectId={project.id} createdAt={project.createdAt} closedAt={project.closedAt} />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}