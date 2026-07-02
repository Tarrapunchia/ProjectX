import { Calendar, AlertCircle, Clock, CheckCircle2, MoreHorizontal, Filter, ArrowUpDown, ShieldCheck } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import helpers from "../../utilities/helpers";
import { useWebSocket } from "../../utilities/WebSocketContext";

const priorityWeight: Record<string, number> = {
    CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, NONE: 1,
};

const priorityColors: Record<string, string> = {
    NONE: "#45619e", LOW: "#ef4444", MEDIUM: "#f59e0b", HIGH: "#10b981", CRITICAL: "#7f1d1d",
};

// Ripristinate le etichette originali hardcoded coerenti con l'app
const statusConfig: Record<string, { label: string, icon: any }> = {
    TODO: { label: "To Do", icon: Clock },
    ACTIVE: { label: "Active", icon: AlertCircle },
    REVIEW: { label: "In Review", icon: MoreHorizontal },
    COMPLETED: { label: "Completed", icon: CheckCircle2 },
    CLOSED: { label: "Closed", icon: CheckCircle2 },
};

const ROLE_OWNER = 1;

const sortOptions = [
    { value: 'dueDate', icon: Calendar },
    { value: 'priority', icon: AlertCircle },
    { value: 'alphabetical', icon: ArrowUpDown },
];

export default function TasksLibrary() {
    const { t, i18n } = useTranslation();
    const { activeUser } = useWebSocket();
    const [rawData, setRawData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>("dueDate");
    const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
    const [onlyOwned, setOnlyOwned] = useState<boolean>(false);
    
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        (async () => {
            const res = await helpers.getter('/api/v1/users/activeUsersProjects', null);
            if (res?.success) {
                setRawData(res.data);
                setSelectedProjects(res.data.map((item: any) => item.project.id));
            }
            setIsLoading(false);
        })();
    }, []);

    const projectsList = useMemo(() => rawData.map(item => ({ 
        id: item.project.id, name: item.project.name, isOwner: item.roleId === ROLE_OWNER 
    })), [rawData]);

    const ownerProjectsList = useMemo(() => projectsList.filter(p => p.isOwner), [projectsList]);

    const toggleOnlyOwned = () => {
        if (onlyOwned) {
            setOnlyOwned(false);
            setSelectedProjects(projectsList.map(p => p.id));
        } else {
            setOnlyOwned(true);
            setSelectedProjects(ownerProjectsList.map(p => p.id));
        }
    };

    const toggleProject = (id: number) => {
        setSelectedProjects(prev => {
            const next = prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id];
            if (onlyOwned) setOnlyOwned(false);
            return next;
        });
    };

    const toggleAllProjects = () => {
        if (selectedProjects.length === projectsList.length) {
            setSelectedProjects([]);
            setOnlyOwned(false);
        } else {
            setSelectedProjects(projectsList.map(p => p.id));
        }
    };

    const handleStatusChange = (projectId: number, taskId: number, newStatus: string) => {
        setRawData(prev => prev.map(item => item.project.id === projectId ? { ...item, project: { ...item.project, tasks: item.project.tasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t) } } : item));
    };

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date || date === "") return "N/A";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString(i18n.language === 'en' ? 'en-GB' : i18n.language, { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const processedTasks = useMemo(() => {
        let list: any[] = [];
        rawData.forEach(item => {
            item.project.tasks.forEach((task: any) => {
                if (item.roleId === ROLE_OWNER || task.participants?.some((tp: any) => String(tp.participantId) === String(activeUser?.id))) {
                    list.push({ ...task, projectName: item.project.name, projectId: item.project.id, roleId: item.roleId });
                }
            });
        });
        list = list.filter(t => selectedProjects.includes(t.projectId));
        if (onlyOwned) list = list.filter(t => t.roleId === ROLE_OWNER);
        list.sort((a, b) => {
            if (sortBy === 'dueDate') return (!a.dueDate ? 1 : !b.dueDate ? -1 : new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
            return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        });
        return list;
    }, [rawData, selectedProjects, onlyOwned, sortBy, activeUser]);

    if (isLoading) return <div className="w-full h-full flex items-center justify-center text-gray-400">{t("tasks_library.loading")}</div>;

    return (
        <div className="flex flex-col h-full w-full p-6 bg-main-bg-color overflow-y-auto custom-scrollbar">
            <h1 className="text-2xl font-bold text-text-main mb-6 shrink-0">{t("tasks_library.page_title")}</h1>
            <div className="flex flex-wrap gap-4 mb-8 shrink-0" ref={containerRef}>
                <div className="relative">
                    <button onClick={() => setOpenDropdown(openDropdown === 'projects' ? null : 'projects')} className={`flex items-center gap-2 bg-side-bg-color border text-sm font-medium rounded-xl px-4 py-2.5 transition-colors cursor-pointer shadow-sm ${openDropdown === 'projects' ? 'border-text-main text-text-main' : 'border-overlay-border-color text-text-main hover:border-text-main'}`}>
                        <Filter size={14} /> <span>{t("tasks_library.filter_projects", { count: selectedProjects.length })}</span>
                    </button>
                    {openDropdown === 'projects' && (
                        <div className="absolute top-full mt-2 left-0 w-64 bg-side-bg-color border border-overlay-border-color rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
                            <div className="p-2 border-b border-overlay-border-color flex flex-col gap-1">
                                <label className="flex items-center gap-3 text-sm text-text-main cursor-pointer px-3 py-2 hover:bg-main-bg-color rounded-lg"><input type="checkbox" checked={selectedProjects.length === projectsList.length && projectsList.length > 0} onChange={toggleAllProjects} className="accent-owner-color w-4 h-4 cursor-pointer" /> <span className="font-bold text-text-main">{t("tasks_library.select_all")}</span></label>
                                <label className="flex items-center gap-3 text-sm text-text-main cursor-pointer px-3 py-2 hover:bg-main-bg-color rounded-lg"><input type="checkbox" checked={onlyOwned} onChange={toggleOnlyOwned} className="accent-owner-color w-4 h-4 cursor-pointer" /> <span className="flex items-center gap-1.5 font-bold text-text-main"><ShieldCheck size={14} /> {t("tasks_library.only_owned")}</span></label>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">{projectsList.map(p => <label key={p.id} className="flex items-center gap-3 text-sm text-text-main cursor-pointer px-3 py-2 hover:bg-main-bg-color rounded-lg"><input type="checkbox" checked={selectedProjects.includes(p.id)} onChange={() => toggleProject(p.id)} className="accent-owner-color w-4 h-4 cursor-pointer" /> <span className="truncate">{p.name}</span> {p.isOwner && <ShieldCheck size={12} className="text-owner-color ml-auto" />}</label>)}</div>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <button onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')} className={`flex items-center gap-2 bg-side-bg-color border text-sm font-medium rounded-xl px-4 py-2.5 transition-colors cursor-pointer shadow-sm ${openDropdown === 'sort' ? 'border-text-main text-text-main' : 'border-overlay-border-color text-text-main hover:border-text-main'}`}>
                        <ArrowUpDown size={14} /> <span>{t("tasks_library.sort_label", { type: t(`tasks_library.sort_options.${sortBy}`) })}</span>
                    </button>
                    {openDropdown === 'sort' && (
                        <div className="absolute top-full mt-2 left-0 w-48 bg-side-bg-color border border-overlay-border-color rounded-xl shadow-2xl z-50 p-1">{sortOptions.map(option => <button key={option.value} onClick={() => { setSortBy(option.value); setOpenDropdown(null); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${sortBy === option.value ? 'bg-owner-color/10 text-owner-color' : 'text-text-main hover:bg-main-bg-color'}`}><option.icon size={14} />{t(`tasks_library.sort_options.${option.value}`)}</button>)}</div>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-4">
                {processedTasks.map((task) => {
                    const StatusIcon = statusConfig[task.status]?.icon || Clock;
                    return (
                        <div key={`${task.projectId}-${task.id}`} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-side-bg-color border border-overlay-border-color rounded-xl shadow-sm hover:border-text-main transition-all gap-4 group">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1"><span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">{task.projectName}</span>{task.roleId === ROLE_OWNER && <span className="flex items-center"><ShieldCheck size={12} className="text-owner-color" /></span>}</div>
                                <div className="flex items-center gap-3 mb-2"><h3 className="text-base font-semibold text-text-main truncate group-hover:text-text-main transition-colors">{task.name}</h3><span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white tracking-wider shrink-0" style={{ backgroundColor: priorityColors[task.priority] }}>{task.priority}</span></div>
                                <p className="text-sm text-zinc-400 line-clamp-2">{task.description || t("tasks_library.no_description")}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                                <div className="flex flex-col gap-1.5 text-[11px] text-zinc-500 border-l border-overlay-border-color pl-4"><div className="flex items-center gap-1.5"><Calendar size={12} /><span>{t("tasks_library.created_at", { date: formatDate(task.createdAt) })}</span></div><div className="flex items-center gap-1.5"><AlertCircle size={12} className={task.dueDate && new Date(task.dueDate) < new Date() && !['COMPLETED', 'CLOSED'].includes(task.status) ? "text-red-400" : ""} /><span className={task.dueDate && new Date(task.dueDate) < new Date() && !['COMPLETED', 'CLOSED'].includes(task.status) ? "text-red-400 font-bold" : ""}>{t("tasks_library.due_date", { date: formatDate(task.dueDate) })}</span></div></div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                        <StatusIcon size={14} />
                                    </div>
                                    <select 
                                        value={task.status} 
                                        onChange={(e) => handleStatusChange(task.projectId, task.id, e.target.value)} 
                                        disabled={task.roleId !== ROLE_OWNER} 
                                        className={`appearance-none bg-bg-color border border-overlay-border-color text-text-main text-xs font-bold rounded-lg pl-9 pr-10 py-2.5 focus:outline-none focus:border-text-main shadow-sm ${task.roleId === ROLE_OWNER ? 'cursor-pointer hover:border-text-main' : 'cursor-not-allowed opacity-50'}`}
                                    >
                                        {Object.keys(statusConfig).map(s => (
                                            <option key={s} value={s} className="bg-side-bg-color text-text-main">
                                                {statusConfig[s].label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                        <ArrowUpDown size={12} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {processedTasks.length === 0 && <div className="text-center py-20 text-zinc-500 bg-side-bg-color border border-overlay-border-color rounded-2xl border-dashed"><p className="text-lg">{t("tasks_library.no_tasks")}</p></div>}
            </div>
        </div>
    );
}