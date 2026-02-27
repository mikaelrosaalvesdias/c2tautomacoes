"use client";

import { ArcElement, Chart as ChartJS, type ChartOptions, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

export type DonutItem = {
  label: string;
  value: number;
  color: string;
};

type CompanyDonutChartProps = {
  items: DonutItem[];
};

export function CompanyDonutChart({ items }: CompanyDonutChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  const data = {
    labels: items.map((item) => item.label),
    datasets: [
      {
        data: items.map((item) => item.value),
        backgroundColor: items.map((item) => item.color),
        borderWidth: 0
      }
    ]
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(4, 8, 20, 0.92)",
        titleColor: "#f8fafc",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(124, 252, 0, 0.3)",
        borderWidth: 1,
        callbacks: {
          label(context) {
            const value = Number(context.raw || 0);
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${context.label}: ${pct}% (${value})`;
          }
        }
      }
    }
  };

  return (
    <div className="flex h-44 items-center justify-center">
      <div className="relative h-36 w-36">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-800 text-foreground">{items.length}</span>
          <span className="text-[10px] text-muted-foreground">empresas</span>
        </div>
      </div>

      <div className="ml-6 space-y-2.5">
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.label} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-xs font-600 text-foreground">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
