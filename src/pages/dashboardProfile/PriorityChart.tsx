import { Pie } from "react-chartjs-2";

import 
{
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function PriorityChart() {
  const data = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        label: "Tasks",
        data: [12, 7, 4],
        backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: 
    {
      title: {
        display: true,
        text: "Distribuzione Priorità", 
        color: "#111827", 
        font: 
        {
          size: 18,
          weight: "bold" as const,
          family: "sans-serif",
        },
        padding: 
        {
          top: 10,
          bottom: 30,
        },
      },
      legend: {
        position: "left" as const,
        labels: {
          boxWidth: 12,
          padding: 12,
          color: "#111827",
        generateLabels(chart: ChartJS) 
        {
            const data = chart.data;
            const dataset = data.datasets[0];
            const bgColors = dataset.backgroundColor as string[];

            return data.labels!.map((label, i) => 
            ({
                    text: `${label} (${dataset.data[i]})`,
                    fillStyle: bgColors[i],
                    strokeStyle: bgColors[i],
                    lineWidth: 1,
                    hidden: !chart.getDataVisibility(i),
                    index: i,
            }));
          },
        },
      },
    },
    layout: {
      padding: {
        top: 20,
      },
    },
    maintainAspectRatio: false,
  };

  return (
      <Pie data={data} options={options} />
  );
}
