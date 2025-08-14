"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

type GenderDatum = { label: string; count: number };

const COLORS = ["#6366F1", "#EF4444", "#9CA3AF"]; // male, female, other/unknown

export function GenderChart({ data }: { data: GenderDatum[] }) {
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
