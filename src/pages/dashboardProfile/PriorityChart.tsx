import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PriorityChart() 
{
  const data = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        label: "Tasks",
        data: [12, 7, 4], // <-- qui puoi passare i tuoi valori reali
        backgroundColor: [
          "#ef4444", // rosso high
          "#f59e0b", // arancione medium
          "#10b981", // verde low
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          padding: 16,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-70">
      <Pie data={data} options={options} />
    </div>
  );
}
