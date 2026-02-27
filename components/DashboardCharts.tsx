"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import type { GenericRecord } from "@/lib/record-utils";
import { getDateValue, getField } from "@/lib/record-utils";

type Props = {
  actionRows: GenericRecord[];
  emailRows: GenericRecord[];
};

function buildDailyData(rows: GenericRecord[], days = 14) {
  const map: Record<string, number> = {};
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    map[d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })] = 0;
  }
  const threshold = now - days * 86400000;
  for (const row of rows) {
    const d = getDateValue(row);
    if (d && d.getTime() >= threshold) {
      const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (key in map) map[key]++;
    }
  }
  return Object.entries(map).map(([date, value]) => ({ date, value }));
}

function buildCompanyData(rows: GenericRecord[]) {
  const map: Record<string, number> = {};
  for (const row of rows) {
    const c = getField(row, ["empresa"]) || "Outros";
    map[c] = (map[c] ?? 0) + 1;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

const COLORS = ["#7CFC00", "#FFD700", "#9B30FF", "#38bdf8", "#f87171"];

const tooltipStyle = {
  backgroundColor: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "8px",
  color: "#f0f0f0",
  fontSize: "12px"
};

export function DashboardCharts({ actionRows, emailRows }: Props) {
  const lineData = buildDailyData(actionRows, 14);
  const donutData = buildCompanyData([...actionRows, ...emailRows]);
  const total = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Line chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-600 text-foreground">Gráfico de Ações por Dia</p>
          <span className="text-xs text-muted-foreground">Últimos 14 dias</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} width={28} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#7CFC00", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Line type="monotone" dataKey="value" stroke="#7CFC00" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#7CFC00" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Donut chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-600 text-foreground">Distribuição por Empresa</p>
          <span className="text-xs text-muted-foreground">Últimos 14 dias</span>
        </div>
        <div className="relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                formatter={(value) => <span style={{ color: "#a0a0b0", fontSize: "11px" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute flex flex-col items-center">
            <span className="text-2xl font-700 text-foreground">{total}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
