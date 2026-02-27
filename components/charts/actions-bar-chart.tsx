"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type ActionsBarChartProps = {
  labels: string[];
  values: number[];
};

export function ActionsBarChart({ labels, values }: ActionsBarChartProps) {
  const maxValue = Math.max(...values, 1);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderRadius: 6,
        borderSkipped: false,
        backgroundColor: values.map((value) =>
          value >= maxValue
            ? "oklch(0.85 0.25 131 / 0.9)"
            : "oklch(0.85 0.25 131 / 0.45)"
        )
      }
    ]
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(4, 8, 20, 0.92)",
        titleColor: "#f8fafc",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(124, 252, 0, 0.3)",
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "rgba(148, 163, 184, 0.95)", font: { size: 10 } },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(100, 116, 139, 0.15)" },
        ticks: { display: false },
        border: { display: false }
      }
    }
  };

  return (
    <div className="h-44 pt-4">
      <Bar data={data} options={options} />
    </div>
  );
}
