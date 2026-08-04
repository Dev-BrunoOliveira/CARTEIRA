import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MonthlyChartData } from "../types/finance";

interface MonthlyChartProps {
  data: MonthlyChartData[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  return (
    <section className="app-glass-section chart-section">
      <h3>Comparativo Mensal</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Bar dataKey="Ganhos" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
