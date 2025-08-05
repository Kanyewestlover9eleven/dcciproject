// src/app/(dashboard)/dashboard/components/LicenseChart.tsx
"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export function LicenseChart({
  data,
}: { data: { type: string; count: number }[] }) {
  return (
    <div className="bg-[#003554] rounded-2xl shadow-sm p-6">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            dataKey="count"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            labelLine={false}
            label={({ index, percent }) =>
              typeof index === "number"
                ? `${data[index].type}: ${(percent! * 100).toFixed(0)}%`
                : ""
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => `${v}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
