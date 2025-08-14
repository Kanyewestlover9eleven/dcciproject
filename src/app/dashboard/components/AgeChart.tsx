"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

type AgeDatum = { label: string; count: number };
const COLORS = ["#10B981", "#6366F1", "#9CA3AF"]; // <40, ≥40, Unknown

export function AgeChart({ data }: { data: AgeDatum[] }) {
  const filtered = data.filter((d) => d.count > 0);
  const chartData = filtered.length ? filtered : [{ label: "No Data", count: 1 }];

  return (
    <div className="bg-[#003554] rounded-2xl shadow-sm p-6">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) =>
              `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => `${v}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
