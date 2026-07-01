import type { ProjectDetailed } from "../../utilities/WebSocketContext";

interface TaskCardProps {
	projectID:	ProjectDetailed['id'];
	taskList:	ProjectDetailed['tasks'];
}

export default function TaskCard ({ projectID, taskList } : TaskCardProps) {
	const filtered = taskList?.filter((t) => String(t.projectId) === String(projectID));

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
		<div className="flex flex-col items-center overflow-y-auto scrollbar-thin scrollbar-thumb-overlay-border-color scrollbar-track-transparent h-full">
			<h3 className="text-xl font-bold self-start ml-[5%] mb-4">Tasks</h3>
			{filtered?.map((task) => {
				const progress = calcProgress(task.createdAt, task.closedAt);
				return (
				<div key={task.id}
					className="flex flex-col gap-2.5 bg-bg-color h-62.5 w-[95%] rounded-xs ml-auto mb-2.5 border border-overlay-border-color shrink-0 p-4"
				>
					<h3 className="text-[25px] m-0 w-full leading-tight">{task.name}</h3>
					<div className="line-clamp-3 break-all font-light text-sm opacity-90">{task.description}</div>
					<div className="w-[90%] h-0.75 bg-linear-to-r from-[#2ecc71] via-[#f1c40f] to-[#e74c3c] rounded-xl mt-auto mx-auto relative overflow-hidden">
						<div className="h-full bg-transparent rounded-xl transition-[width] duration-500 ease-in-out relative
								after:content-[''] after:absolute after:left-full after:top-0 after:w-[9999px] after:h-full after:bg-category-bg-color"
								style={{ width: `${progress}%` }}
						/>
					</div>
					<div className="w-[90%] mx-auto flex justify-between text-[12px] text-[#cfcfcf]">
						<p>{new Date(task.createdAt).toLocaleDateString('it-IT')}</p>
						<p>{task.closedAt
							? new Date(task.closedAt).toLocaleDateString('it-IT')
							: 'N/A'}
						</p>
					</div>
					<div className="flex justify-between items-center text-xs mt-1">
						<p className="opacity-70">Status: <span className="font-medium text-white">{task.status}</span></p>
						<p className="uppercase tracking-wider font-bold text-[10px] text-owner-color">Priority</p>
					</div>
				</div>
				);
			})}
		</div>
	)
}