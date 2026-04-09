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

export default function PriorityChart({ taskData }: { taskData?: TaskInfos }) {
  if (!taskData) return;
  const counts: Record<Priority, number> = {
    NONE: Number(taskData.NONE), LOW: Number(taskData.LOW), MEDIUM: Number(taskData.MEDIUM), HIGH: Number(taskData.HIGH), CRITICAL: Number(taskData.CRITICAL),
  };

  const labels = PRIORITIES
  console.log('labels' + labels)
  const data = {
    labels,
    datasets: [
      {
        label: "Tasks",
        data: PRIORITIES.map((p) => counts[p]),
        backgroundColor: PRIORITIES.map((p) => priorityColors[p]),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Distribuzione Priorità",
      },
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
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: 280 }}>
      <Pie data={data as any} options={options as any} />
    </div>
  );
}