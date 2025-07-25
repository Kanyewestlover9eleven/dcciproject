// src/app/dashboard/components/StatCard.tsx
import { Users } from "lucide-react";

export function StatCard({
  label,
  value,
  Icon = Users,
}: {
  label: string;
  value: number;
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center bg-[#003554] p-6 rounded-2xl shadow-sm hover:shadow-md transition">
      <div className="p-3 bg-blue-100 rounded-full">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="ml-4">
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  );
}
