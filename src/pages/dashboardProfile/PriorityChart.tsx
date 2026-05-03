import { Pie } from "react-chartjs-2";
import { useState, useEffect } from "react"; // Aggiunto useEffect
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
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

export default function PriorityChart({ taskData }: { taskData: TaskInfos }) {
  if (!taskData) return null;

  // --- LOGICA RESPONSIVE ---
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // --------------------------

  const [activePriorities, setActivePriorities] = useState<Priority[]>(PRIORITIES);

  const chartData = {
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

  const options = {
    plugins: {
      title: { 
        display: true, 
        text: "Priority Distribution",
        color: 'rgb(var(--text-main))',
        // Titolo più piccolo su mobile
        font: { size: isMobile ? 12 : 14 }, 
        padding: { bottom: isMobile ? 10 : 20 }
      },
      legend: {
        // Legenda SOTTO su mobile, a SINISTRA su desktop
        position: "bottom" as const,
        onClick: (_: any, legendItem: any, legend: any) => {
          const index = legendItem.index;
          const ci = legend.chart;
          ci.toggleDataVisibility(index);
          ci.update();
          const clickedPriority = PRIORITIES[index];
          setActivePriorities((prev) => 
            prev.includes(clickedPriority) 
              ? prev.filter(p => p !== clickedPriority) 
              : [...prev, clickedPriority]
          );
        },
        labels: {
          generateLabels(chart: any) {
            const d = chart.data;
            const values = d.datasets?.[0]?.data ?? [];
            return (d.labels ?? []).map((lbl: string, i: number) => ({
              text: `${lbl} (${values[i] ?? 0})`,
              fillStyle: (d.datasets?.[0]?.backgroundColor?.[i]) ?? "#999",
              strokeStyle: (d.datasets?.[0]?.backgroundColor?.[i]) ?? "#999",
              lineWidth: 1,
              hidden: !chart.getDataVisibility(i),
              index: i,
              fontColor: 'rgb(var(--text-main))'
            }));
          },
          boxWidth: isMobile ? 8 : 12, // Quadratini più piccoli su mobile
          font: { size: isMobile ? 9 : 11 }, // Testo più piccolo su mobile
          padding: isMobile ? 8 : 18
        },
      },
    },
    maintainAspectRatio: false,
  };

  const filteredTasks = taskData.tasks.filter(t => 
    activePriorities.includes((t.priority as Priority) || "NONE")
  );

  return (
    /* Modificata la grid: 1 colonna su mobile, 2 su desktop */
    <div className="relative border border-overlay-border-color rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 min-h-[300px] max-h-full text-text-main overflow-hidden">
      <div className="relative w-full h-[200px] md:h-full min-h-0 overflow-hidden text-text-main">
        {taskData && taskData.tasks.length > 0 ? (
          <Pie data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-text-main text-sm">
            Loading chart...
          </div>
        )}
      </div>

      {/* SEZIONE LISTA TASK */}
      <div className="flex flex-col gap-2 overflow-y-auto md:max-h-[40vh] pr-1">
        {filteredTasks.map((task, index) => {
          const pKey = (task.priority as Priority) || "NONE";
          const borderColor = priorityColors[pKey];

          return (
            <div 
              key={task.id}
              className="relative border-l-2 pl-2 text-sm leading-tight group"
              style={{ borderColor: borderColor }}
            >
              <div className="flex flex-col p-2 border rounded-lg border-overlay-border-color hover:border-white transition-colors shadow-sm">
                <span className="text-xs font-semibold text-text-main truncate">
                  {task.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  Stato: {task.status}
                </span>
              </div>

              {/* Tooltip (nascosto su mobile per non coprire tutto, o gestito via hover) */}
              <div className={`
                  absolute left-2 w-max max-w-[180px] md:max-w-xs bg-black shadow-lg border border-zinc-700 rounded p-2 z-50
                  opacity-0 pointer-events-none
                  group-hover:opacity-100 group-hover:pointer-events-auto
                  transition-opacity duration-150
                ${index < 2 ? "top-full mt-2" : "bottom-full mb-2"}
              `}>
                <span className="block text-xs font-bold" style={{ color: borderColor }}>
                  Priority: {pKey}
                </span>
                <p className="text-white text-[10px] md:text-xs mt-1">
                  {task.description || "Nessuna descrizione."}
                </p>
              </div>
            </div>
          );
        })}

        {taskData.tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-4 opacity-50">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center">
              No tasks
            </span>
          </div>
        )}
      </div>
    </div>
  );
}