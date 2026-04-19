import { Pie } from "react-chartjs-2";
import { useState } from "react";
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
      title: { display: true, text: "Priority Distribution", font: { size: 14 }, color: "#ffffff" },
      legend: {
        position: "left" as const,
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
			  fontColor: "#ffffff"
            }));
          },
          boxWidth: 12,
          font: { size: 11 }
        },
      },
    },
    maintainAspectRatio: false,
  };

  // Filtriamo i task prima di renderizzarli
  const filteredTasks = taskData.tasks.filter(t => 
    activePriorities.includes((t.priority as Priority) || "NONE")
  );

  return (
    <div className="relative border border-radius: 8px border-overlay-border-color rounded-lg shadow p-4 grid grid-cols-[1fr_1fr] gap-2">
      
	  <div className="relative w-full min-h-0 max-h-full overflow-hidden">
      {taskData && taskData.tasks.length > 0 ?
	  (
        <Pie data={chartData} options={options} />
      ) : 
	  (
        <div className="flex items-center justify-center h-full text-gray-400">
          Loading chart...
        </div>
      )}
    </div>

      {/* SEZIONE LISTA TASK */}
      <div className="flex flex-col gap-2 overflow-y-auto">
        
        {/* Renderizziamo i task filtrati */}
        {filteredTasks.map((task, index) => {
          const pKey = (task.priority as Priority) || "NONE";
          const borderColor = priorityColors[pKey];

          return (
            <div 
              key={task.id}
              className="relative border-l-2 pl-2 text-sm leading-tight group"
              style={{ borderColor: borderColor }}
            >
              <div className="flex flex-col p-2 border rounded-lg
			  		border-radius: 8px border-overlay-border-color hover:border-white 
					transition-colors shadow-sm">
                <span className="text-xs font-semibold text-slate-800 truncate text-white">
                  {task.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  Stato: {task.status}
                </span>
              </div>

              {/* Tooltip */}
              <div className={`
                  absolute left-2 w-max max-w-xs bg-white shadow-lg border rounded p-2 z-10
                  opacity-0 pointer-events-none
                  group-hover:opacity-100 group-hover:pointer-events-auto
                  transition-opacity duration-150
                ${index < 2 ? "top-full mt-2" : "bottom-full mb-2"}
              `}>
                <div className="flex flex-col mb-2 border-b border-white/10 pb-1 w-full">
                  <span className="text-black text-xs mt-1 truncate w-full" style={{ color: borderColor }}>
                    Priority: {pKey}
                  </span>
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

        {taskData.tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <span className="text-[11px] font-bold text-white uppercase tracking-widest text-center">
              No tasks to show
            </span>
          </div>
        )}

      </div>
    </div>
  );
}