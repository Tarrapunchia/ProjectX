import { Pie } from "react-chartjs-2";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { useTranslation } from "react-i18next";
import type { TaskInfos } from "../../data/types";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

type Priority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const priorityColors: Record<Priority, string> = {
  NONE: "#45619e",
  LOW: "#ef4444",
  MEDIUM: "#f59e0b",
  HIGH: "#10b981",
  CRITICAL: "#7f1d1d",
};

const PRIORITIES: Priority[] = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function PriorityChart({ taskData }: { taskData: TaskInfos | null }) 
{
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [textColor, setTextColor] = useState("#000");
    const [activePriorities, setActivePriorities] = useState<Priority[]>(PRIORITIES);

    const readColor = useCallback(() => 
    {
        const c = getComputedStyle(document.documentElement).getPropertyValue("--color-text").trim();
        if (c) setTextColor(c);
    }, []);

    useEffect(() => {
        readColor();
        const observer = new MutationObserver(readColor);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, [readColor]);

    const chartData = useMemo(() => 
    {
        if (!taskData) return null;
        return {
        labels: PRIORITIES,
        datasets: [
            {
            label: "Numero Task",
            data: PRIORITIES.map((p) => Number(taskData[p] || 0)),
            backgroundColor: PRIORITIES.map((p) => priorityColors[p]),
            borderWidth: 1,
            },
        ],
        };
    }, [taskData]);

    const options = useMemo(() => ({
        maintainAspectRatio: false,
        plugins: {
        title: { 
            display: true, 
            text: t("priority_chart.title"),
            color: textColor,
            font: { size: isMobile ? 12 : 14 }, 
            padding: { bottom: isMobile ? 10 : 20 },
        },
        legend: {
            position: "bottom" as const,
            onClick: (_: any, legendItem: any, legend: any) => {
            const index = legendItem.index;
            legend.chart.toggleDataVisibility(index);
            legend.chart.update();
            const clickedPriority = PRIORITIES[index];
            setActivePriorities((prev) => 
                prev.includes(clickedPriority) 
                ? prev.filter(p => p !== clickedPriority) 
                : [...prev, clickedPriority]
            );
            },
            labels: {
            generateLabels: (chart: any) => {
                const d = chart.data;
                const values = d.datasets[0].data;
                return d.labels.map((lbl: string, i: number) => ({
                text: `${lbl} (${values[i] || 0})`,
                fillStyle: d.datasets[0].backgroundColor[i],
                hidden: !chart.getDataVisibility(i),
                index: i,
                fontColor: textColor,
                }));
            },
            boxWidth: isMobile ? 8 : 12,
            font: { size: isMobile ? 9 : 11 },
            padding: isMobile ? 8 : 18,
            },
        },
        },
    }), [textColor, isMobile, t]);

    const filteredTasks = useMemo(() => {
        if (!taskData) return [];
        return taskData.tasks.filter(t => 
        activePriorities.includes((t.priority as Priority) || "NONE")
        );
    }, [taskData, activePriorities]);

    if (!taskData || taskData.tasks.length === 0) {
        return (
        <div className="flex flex-col items-center justify-center h-full text-text-main">
            <h2 className="text-lg font-semibold">{t("priority_chart.title")}</h2>
            <p className="text-gray-500 text-sm mt-4">{t("priority_chart.empty")}</p>
        </div>
        );
    }

    return (
        <div className="h-full relative p-4 grid grid-cols-[1.2fr_1fr] gap-4 max-h-full text-text-main overflow-hidden">
        
            <div className="relative w-full h-full min-h-0 overflow-hidden">
                {chartData && <Pie data={chartData} options={options} />}
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto h-0 min-h-full pr-1 custom-scrollbar">
                {filteredTasks.map((task, index) => {
                    const pKey = (task.priority as Priority) || "NONE";
                    const borderColor = priorityColors[pKey];

                    return (
                        <div 
                            key={task.id}
                            className="relative border-l-2 pl-2 text-sm leading-tight group"
                            style={{ borderColor: borderColor }}
                        >
                            <div className="flex flex-col p-2 border rounded-lg border-overlay-border-color hover:border-text-main transition-colors shadow-sm bg-side-bg-color/50">
                                <span className="text-xs font-semibold text-text-main truncate">
                                    {task.name}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {t("priority_chart.status")}: {task.status}
                                </span>
                            </div>

                            <div className={`
                                absolute left-2 w-max max-w-[150px] bg-black shadow-lg border border-zinc-700 rounded p-2 z-[100]
                                opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto
                                transition-opacity duration-150
                                ${index < 2 ? "top-full mt-2" : "bottom-full mb-2"}
                            `}>
                                <span className="block text-xs font-bold" style={{ color: borderColor }}>
                                    {t("priority_chart.priority")}: {pKey}
                                </span>
                                <p className="text-white text-[10px] mt-1">
                                    {task.description || t("priority_chart.no_description")}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {filteredTasks.length === 0 && (
                    <div className="flex items-center justify-center h-full opacity-50">
                        <span className="text-[10px] uppercase tracking-widest text-center">{t("priority_chart.no_tasks")}</span>
                    </div>
                )}
            </div>
        </div>
    );
}