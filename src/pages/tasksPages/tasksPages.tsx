import { Calendar, AlertCircle, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from "react";
import helpers from "../../utilities/helpers";
import type { TaskInfos } from "../../data/types";

type Task = TaskInfos["tasks"][0];

const priorityColors: Record<Task['priority'], string> = 
{
	NONE: "#45619e",
	LOW: "#ef4444",
	MEDIUM: "#f59e0b",
	HIGH: "#10b981",
	CRITICAL: "#7f1d1d",
};

const statusConfig: Record<string, { label: string, icon: any }> = 
{
	TODO: { label: "To Do", icon: Clock },
	ACTIVE: { label: "Active", icon: AlertCircle },
	REVIEW: { label: "In Review", icon: MoreHorizontal },
	COMPLETED: { label: "Completed", icon: CheckCircle2 },
	CLOSED: { label: "Completed", icon: CheckCircle2 },
};

export default function TasksLibrary() 
{
	const [tasks, setTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() =>
	{
		(async () => {
		const res = await helpers.getter('/api/v1/tasks/activeUserTasks', null);
		if (res.success) {
			setTasks(res.data.tasks);
		}
		setIsLoading(false);
		})();
	}, []);

	const handleStatusChange = (taskId: string, newStatus: Task['status']) => 
	{
		setTasks(prevTasks =>
		prevTasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
		);
	};

	const formatDate = (date: Date | string | null | undefined) => 
	{
		if (!date || date === "") return "N/A";
		const d = new Date(date);
		return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
	};

	if (isLoading) 
	{
		return (
		<div className="w-full h-full flex items-center justify-center text-gray-400">
			Loading tasks...
		</div>
		);
	}

	return (
		<div className="flex flex-col h-full w-full p-6 bg-main-bg-color overflow-y-auto custom-scrollbar">
		<h1 className="text-2xl font-bold text-text-main mb-6">Tasks Library</h1>

		<div className="flex flex-col gap-4">
		{tasks.map((task) =>
		{
			const StatusIcon = statusConfig[task.status].icon;

			return (
				<div key={task.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-side-bg-color border border-overlay-border-color rounded-xl shadow-sm hover:border-slate-600 transition-colors gap-4">
					{/* Sezione Sinistra */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 mb-2">
						<h3 className="text-base font-semibold text-text-main truncate">
							{task.name}
						</h3>
						<span 
							className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white tracking-wider"
							style={{ backgroundColor: priorityColors[task.priority] }}
						>
							{task.priority}
						</span>
						</div>
						
						<p className="text-sm text-gray-400 line-clamp-2 mb-4 md:mb-0">
						{task.description || "No description provided for this task."}
						</p>
					</div>

					{/* Sezione Destra */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
						<div className="flex flex-col gap-1.5 text-xs text-gray-400 border-l border-overlay-border-color pl-4">
							<div className="flex items-center gap-1.5">
								<Calendar size={13} />
								<span>Created: {formatDate(task.createdAt)}</span>
							</div>
							<div className="flex items-center gap-1.5">
								<AlertCircle size={13} className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? "text-red-400" : ""} />
								<span className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? "text-red-400 font-medium" : ""}>
									Due: {formatDate(task.dueDate)}
								</span>
							</div>
						</div>

						<div className="relative flex items-center ml-2">
							<div className="absolute left-3 pointer-events-none text-gray-400">
								<StatusIcon size={14} />
							</div>
							<select
								value={task.status}
								onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
								className="appearance-none bg-main-bg-color border border-overlay-border-color text-text-main text-xs font-medium rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">

								<option value="TODO">To Do</option>
								<option value="ACTIVE">Active</option>
								<option value="REVIEW">In Review</option>
								<option value="COMPLETED">Completed</option>
							</select>
							<div className="absolute right-3 pointer-events-none text-gray-400">
								<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
							</div>
						</div>
					</div>
				</div>
				);
			})}

			{tasks.length === 0 && (
			<div className="text-center py-12 text-gray-500">
				<p>No tasks found.</p>
			</div>
			)}
		</div>
		</div>
	);
}