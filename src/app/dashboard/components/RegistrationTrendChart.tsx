// src/app/(dashboard)/dashboard/components/RegistrationTrendChart.tsx
"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

export function RegistrationTrendChart({
  data,
}: { data: { date: string; count: number }[] }) {
  return (
    <div className="bg-[#003554] rounded-2xl shadow-sm p-6">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(v: number) => `${v} regs`} />
          <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
