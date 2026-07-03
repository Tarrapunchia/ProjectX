import type { ProjectTasks } from "../../data/types";

interface TaskCardProps {
	projectID:	ProjectTasks['projectId'];
	taskList:	ProjectTasks[];
}

export default function TaskCard ({ projectID, taskList } : TaskCardProps) {
	const filtered = taskList.filter((t) => t.projectId === projectID);

	const calcProgress = (createdAt: string | Date, dueDate?: string | Date | null): number => {
		if (!dueDate) return 0;
		const start = new Date(createdAt).getTime();
		const end = new Date(dueDate).getTime();
		const now = Date.now();
		if (end <= start) return 100;
		const progress = ((now - start) / (end - start)) * 100;
		return Math.min(100, Math.max(0, Math.round(progress)));
	};
	
	return (
		<div className="tasks-info">
			<h3>Tasks</h3>
			{filtered.map((task) => {
				const progress = calcProgress(task.createdAt, task.dueDate);
				return (
				<div key={task.id} className="task-card">
					<h3>{task.name}</h3>
					<div className="task-description">{task.description}</div>
					<div className="task-progress-container">
						<div className="task-progress-fill" style={{ width: `${progress}%` }} />
					</div>
					<div className="task-dates">
						<p>{new Date(task.createdAt).toLocaleDateString('it-IT')}</p>
						<p>{task.dueDate
							? new Date(task.dueDate).toLocaleDateString('it-IT')
							: 'N/A'}
						</p>
					</div>
					<p>Status: {task.status}</p>
					<p>Priority</p>
				</div>
				);
			})}
		</div>
	)
}