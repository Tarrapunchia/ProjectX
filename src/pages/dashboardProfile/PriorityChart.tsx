import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import type { TaskInfos } from "../../data/types";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

type Priority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const priorityColors: Record<Priority, string> = {
  NONE: "#111827",
  LOW: "#ef4444",
  MEDIUM: "#f59e0b",
  HIGH: "#10b981",
  CRITICAL: "#7f1d1d",
};

const PRIORITIES: Priority[] = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function PriorityChart({ taskData }: { taskData: TaskInfos }) {
  if (!taskData) return null;

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
      title: { display: true, text: "Priority Distribution", font: { size: 14 } },
      legend: {
        position: "left" as const,
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
            }));
          },
          boxWidth: 12,
          font: { size: 11 }
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="relative bg-white rounded-lg shadow p-4 grid grid-cols-[1fr_1fr] gap-2">
      
      {/* SEZIONE GRAFICO */}
      <div className="relative w-full min-h-0 max-h-full overflow-hidden">
        <Pie data={chartData} options={options}/>
      </div>

      {/* SEZIONE LISTA TASK (NOTIFICHE) */}
      <div className="flex flex-col gap-2 overflow-y-auto">
        
        {taskData.tasks.map((task, index) => {
          const pKey = (task.priority as Priority) || "NONE";
          const borderColor = priorityColors[pKey];

          return (
            <div 
              key={task.id}
              className="relative border-l-2 pl-2 text-sm leading-tight group"
              style={{ borderColor: borderColor }}
            >
              {/* Card visibile */}
              <div className="flex flex-col p-2 rounded-lg bg-slate-50 hover:bg-gray-300 transition-colors shadow-sm text-black">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {task.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  Stato: {task.status}
                </span>
              </div>

              {/* Tooltip con dettagli su HOVER */}
              <div className={`
                  absolute left-2 w-max max-w-xs bg-white shadow-lg border rounded p-2 z-10
                  opacity-0 pointer-events-none
                  group-hover:opacity-100 group-hover:pointer-events-auto
                  transition-opacity duration-150
                ${index < 2 ? "top-full mt-2" : "bottom-full mb-2"}
              `}>
                <div className="flex flex-col mb-2 border-b border-white/10 pb-1 w-full">
                  <span 
                    className="text-black text-xs mt-1 truncate w-full" 
                    style={{ color: borderColor }}
                  >
                    Priority: {pKey}
                  </span>

                  {/* Description - Riga 2 con Truncate */}
                  <p className="text-black text-xs mt-1 truncate w-full">
                    Description: {task.description || "Nessuna descrizione fornita."}
                  </p>
                </div>

                {task.dueDate && (
                  <div className="text-xs text-gray-400 italic">
                    Scadenza: {new Date(task.dueDate).toLocaleDateString('it-IT')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {taskData.tasks.length === 0 && (
          <div className="text-center text-gray-400 text-xs mt-10">Nessun task da mostrare</div>
        )}
      </div>
    </div>
  );
}