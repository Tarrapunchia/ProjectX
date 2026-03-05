import { MOCK_TASKS } from '../../data/mockData';

interface ProgressBarProps {
	projectId: string;
	createdAt: Date;
	closedAt: Date | null;
	showDetails?: boolean;
}

export default function ProgressBar({ projectId, createdAt, closedAt, showDetails = false }: ProgressBarProps) {
	const tasks = MOCK_TASKS.filter((t) => t.projectId === projectId);
	const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
	const percent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

	const start = new Date(createdAt).getTime();
	const now = Date.now();
	const end = closedAt ? new Date(closedAt).getTime() : 0;
	const timePercent = end > start ? Math.min(Math.round(((now - start) / (end - start)) * 100), 100) : 0;

	return (
		<div className="progress-container">
			<div className="progress-bar-container">
				<div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
				{showDetails && timePercent > 0 && (
					<div className="progress-time-marker" style={{ left: `${timePercent}%` }}></div>
				)}
				<span className="progress-bar-label">
					{showDetails ? `${completed}/${tasks.length}` : ''}({percent}%)
				</span>
			</div>
			{showDetails && (
				<div className="progress-dates">
					<span className="project-start-date">{new Date(createdAt).toLocaleDateString('it-IT')}</span>
					{closedAt
						? <span className="project-due-term">{new Date(closedAt).toLocaleDateString('it-IT')}</span>
						: ''}
				</div>
			)}
		</div>
	);
}