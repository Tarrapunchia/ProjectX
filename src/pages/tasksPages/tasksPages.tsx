import { Calendar, AlertCircle, Clock, CheckCircle2, MoreHorizontal, Filter, ArrowUpDown } from 'lucide-react';
import { useEffect, useState, useMemo } from "react";
import helpers from "../../utilities/helpers";
import { useWebSocket } from "../../utilities/WebSocketContext";

const priorityWeight: Record<string, number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    NONE: 1,
};

const priorityColors: Record<string, string> = 
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

// Costante per identificare il ruolo dell'Owner (tipicamente 7 nei tuoi setup)
const ROLE_OWNER = 7;

export default function TasksLibrary() 
{
    const { activeUser } = useWebSocket();
    const [rawData, setRawData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Stati per i filtri e l'ordinamento
    const [filterProject, setFilterProject] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<string>("dueDate");

    useEffect(() =>
    {
        (async () => {
            const res = await helpers.getter('/api/v1/users/activeUsersProjects', null);
            if (res?.success) {
                setRawData(res.data);
            }
            setIsLoading(false);
        })();
    }, []);

    const handleStatusChange = (projectId: number, taskId: number, newStatus: string) => 
    {
        setRawData(prev => prev.map(item => {
            if (item.project.id === projectId) {
                return {
                    ...item,
                    project: {
                        ...item.project,
                        tasks: item.project.tasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t)
                    }
                };
            }
            return item;
        }));
        
        // Qui potresti anche lanciare una chiamata API per salvare il nuovo stato nel DB
        // helpers.putter(`/api/v1/tasks/${taskId}`, { status: newStatus });
    };

    const formatDate = (date: Date | string | null | undefined) => 
    {
        if (!date || date === "") return "N/A";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Elaborazione dati: Appiattimento, Filtraggio permessi/assegnazione, Filtri UI e Ordinamento
    const processedTasks = useMemo(() => {
        let list: any[] = [];

		rawData.forEach(item => {
            const isOwner = item.roleId === ROLE_OWNER;
            
            item.project.tasks.forEach((task: any) => {
                const isAssignedToMe = task.participants?.some((tp: any) => tp.userId === activeUser?.id);

                // Se non sei OWNER e la task non è tua, viene scartata a monte
                if (isOwner || isAssignedToMe) {
                    list.push({
                        ...task,
                        projectName: item.project.name,
                        projectId: item.project.id,
                        roleId: item.roleId 
                    });
                }
            });
        });

        // 2. Filtro per progetto
        if (filterProject !== "ALL") {
            list = list.filter(t => t.projectId.toString() === filterProject);
        }

        // 3. Ordinamento
        list.sort((a, b) => {
            if (sortBy === 'dueDate') {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1; // Le task senza scadenza vanno in fondo
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (sortBy === 'alphabetical') {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === 'priority') {
                const pA = priorityWeight[a.priority] || 0;
                const pB = priorityWeight[b.priority] || 0;
                return pB - pA; // Dal più alto al più basso
            }
            return 0;
        });

        return list;
    }, [rawData, filterProject, sortBy, activeUser]);

    // Genera la lista dei progetti per la tendina dei filtri
    const projectsList = useMemo(() => {
        return rawData.map(item => ({ id: item.project.id, name: item.project.name }));
    }, [rawData]);

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

            {/* Barra dei Filtri e Ordinamento */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <Filter size={14} />
                    </div>
                    <select
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        className="appearance-none bg-side-bg-color border border-overlay-border-color text-text-main text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 focus:outline-none hover:border-slate-500 transition-colors cursor-pointer shadow-sm w-full sm:w-auto"
                    >
                        <option value="ALL">All Projects</option>
                        {projectsList.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <ArrowUpDown size={14} />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-side-bg-color border border-overlay-border-color text-text-main text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 focus:outline-none hover:border-slate-500 transition-colors cursor-pointer shadow-sm w-full sm:w-auto"
                    >
                        <option value="dueDate">Sort by Due Date</option>
                        <option value="priority">Sort by Priority</option>
                        <option value="alphabetical">Sort Alphabetically</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-4">
            {processedTasks.map((task) =>
            {
                const StatusIcon = statusConfig[task.status]?.icon || Clock;
                const isOwner = task.roleId === ROLE_OWNER; // Verifica dei privilegi

                return (
                    <div key={`${task.projectId}-${task.id}`} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-side-bg-color border border-overlay-border-color rounded-xl shadow-sm hover:border-slate-600 transition-colors gap-4">
                        {/* Sezione Sinistra */}
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1 block">
                                {task.projectName}
                            </span>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-base font-semibold text-text-main truncate">
                                    {task.name}
                                </h3>
                                <span 
                                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white tracking-wider shrink-0"
                                    style={{ backgroundColor: priorityColors[task.priority] || priorityColors.NONE }}
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
                                    <AlertCircle size={13} className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && task.status !== 'CLOSED' ? "text-red-400" : ""} />
                                    <span className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && task.status !== 'CLOSED' ? "text-red-400 font-medium" : ""}>
                                        Due: {formatDate(task.dueDate)}
                                    </span>
                                </div>
                            </div>

                            <div className="relative flex items-center ml-2" title={!isOwner ? "Only Project Owners can change the status" : ""}>
                                <div className="absolute left-3 pointer-events-none text-gray-400">
                                    <StatusIcon size={14} />
                                </div>
                                <select
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task.projectId, task.id, e.target.value)}
                                    disabled={!isOwner}
                                    className={`appearance-none bg-main-bg-color border border-overlay-border-color text-text-main text-xs font-medium rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${isOwner ? 'cursor-pointer hover:border-slate-500' : 'cursor-not-allowed opacity-60'}`}
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="REVIEW">In Review</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                                <div className="absolute right-3 pointer-events-none text-gray-400">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {processedTasks.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-side-bg-color border border-overlay-border-color rounded-xl border-dashed">
                <p>No tasks found matching your criteria.</p>
            </div>
            )}
            </div>
        </div>
    );
}