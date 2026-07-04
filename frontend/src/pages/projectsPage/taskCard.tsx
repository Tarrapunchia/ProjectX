import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import { type ProjectDetailed, type Task, type Priority, useWebSocket } from "../../utilities/WebSocketContext";
import helpers from '../../utilities/helpers'

interface TaskCardProps {
    selectedProject: ProjectDetailed;
}

export default function TaskCard ({ selectedProject } : TaskCardProps) {
    const { t, i18n } = useTranslation();
    const { setProjects } = useWebSocket();
    const inputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const priorityRef = useRef<HTMLSelectElement>(null);
    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const taskList: Task[] = selectedProject.tasks ?? [];

    const priorityStyles: Record<Priority, string> = {
        NONE: "#45619e",
        LOW: "#10b981",
        MEDIUM: "#f59e0b",
        HIGH: "#ef4444",
        CRITICAL: "#7f1d1d",
    };

    const calcProgress = (createdAt: string | Date, dueDate?: string | Date | null): number => {
        if (!dueDate) return 0;
        const start = new Date(createdAt).getTime();
        const end = new Date(dueDate).getTime();
        const now = Date.now();
        if (end <= start) return 100;
        const progress = ((now - start) / (end - start)) * 100;
        return Math.min(100, Math.max(0, Math.round(progress)));
    };

    const handleConfirm = async () => {
        const name = inputRef.current?.value.trim() ?? '';
        const description = textAreaRef.current?.value.trim() ?? '';
        const priority = (priorityRef.current?.value ?? 'NONE') as Priority;

        if (!name || !description) return;

        const apiPayload = {
            name,
            projId: Number(selectedProject.id),
            status: "TODO",
            description,
            priority
        };

        const res = await helpers.poster("/api/v1/tasks/addTask", apiPayload)

        if (res?.success) {
            const newTask: Task = {
                id: res.data.id,
                name,
                description,
                status: "TODO",
                createdAt: new Date(),
                closedAt: res.data.closedAt ?? null,
                projectId: String(selectedProject.id),
                priority
            };

            setProjects(prev => prev.map(p =>
                Number(p.id) === Number(selectedProject.id)
                ? { ...p, tasks: [...(p.tasks ?? []), newTask] }
                : p
            ));
        }

        handleCancel();
    }

    const handleCancel = () => {
        if (inputRef.current) inputRef.current.value = '';
        if (textAreaRef.current) textAreaRef.current.value = '';
        if (priorityRef.current) priorityRef.current.value = 'NONE';
        setCreateTaskOpen(false);
    }
    
    return (
        <div className="flex flex-col no-scrollbar items-center overflow-y-auto scrollbar-thin scrollbar-thumb-overlay-border-color scrollbar-track-transparent h-full">
            <span className="flex items-center justify-center w-full text-xl font-bold self-start ml-[5%] mb-4">{t('task_card.title')}</span>
            <button
                onClick={() => setCreateTaskOpen(true)}
                className="border border-overlay-border-color rounded-sm p-2 w-[95%] ml-4 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:cursor-pointer"
            >
                {t('task_card.create_task')}
            </button>
            {taskList.map((task) => {
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
                        <p>{new Date(task.createdAt).toLocaleDateString(i18n.language)}</p>
                        <p>{task.closedAt
                            ? new Date(task.closedAt).toLocaleDateString(i18n.language)
                            : t('task_card.na')}
                        </p>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                        <p className="opacity-70">{t('task_card.status')}: <span className="font-medium text-white">{task.status}</span></p>
                        <p
                            className="uppercase tracking-wider font-bold text-[10px]"
                            style={{ color: priorityStyles[task.priority ?? 'NONE'] }}
                        >
                            {task.priority ?? 'NONE'}
                        </p>
                    </div>
                </div>
                );
            })}
            {createTaskOpen && (
                <div
                    onClick={() => handleCancel()}
                    className="fixed flex justify-center items-center inset-0 w-full h-full backdrop-blur-sm"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col items-center w-[30%] h-[40%] max-w-100 bg-bg-color border border-overlay-border-color rounded-sm">
                        <div className="flex flex-wrap w-full items-center justify-start p-2 gap-4">
                            <div className="flex flex-col w-full">
                                <label>{t('task_card.form.name')}</label>
                                <input
                                    ref={inputRef}
                                    className="w-full p-2 outline-none h-10 border border-overlay-border-color rounded-sm transition-all duration-300 hover:border-owner-color focus:border-owner-color"
                                />
                            </div>
                            <div className="flex flex-col w-full">
                                <label>{t('task_card.form.description')}</label>
                                <textarea
                                    ref={textAreaRef}
                                    className="w-full p-2 outline-none h-25 border border-overlay-border-color rounded-sm resize-none transition-all duration-300 hover:border-owner-color focus:border-owner-color"
                                />
                            </div>
                            <div className="flex flex-col w-full">
                                <label>{t('task_card.form.priority')}</label>
                                <select
                                    ref={priorityRef}
                                    defaultValue="NONE"
                                    className="w-full p-2 outline-none h-10 border border-overlay-border-color rounded-sm bg-bg-color transition-all duration-300 hover:border-owner-color focus:border-owner-color"
                                >
                                    <option value="NONE">None</option>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-row w-full justify-between px-6 pt-2">
                            <button
                                onClick={() => handleConfirm()}
                                className="border border-overlay-border-color rounded-sm p-2 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-110 active:scale-90"
                            >
                                {t('task_card.form.confirm')}
                            </button>
                            <button
                                onClick={() => handleCancel()}
                                className="border border-overlay-border-color rounded-sm p-2 transition-all duration-300 hover:border-owner-color hover:text-owner-color hover:scale-110 active:scale-90"
                            >
                                {t('task_card.form.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}