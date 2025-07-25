// src/app/dashboard/components/LocationChart.tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6"];

export function LocationChart({
  data,
}: {
  data: { location: string; count: number }[];
}) {
  return (
    <div className="bg-[#003554] rounded-2xl shadow-sm p-6">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            dataKey="count"
            nameKey="location"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent! * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, idx) => (
              <Cell key={entry.location} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value} contractors`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
