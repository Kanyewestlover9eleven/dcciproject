// src/app/dashboard/components/RegionDensityList.tsx
"use client";
import * as React from "react";

type RegionItem = { location: string; count: number };

export function RegionDensityList({ data }: { data: RegionItem[] }) {
  const rows = [...data].sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const pct = (r.count / max) * 100;
        return (
          <div key={r.location || "Unknown"} className="flex items-center gap-3">
            <div className="w-40 truncate">{r.location || "Unknown"}</div>
            <div className="flex-1 h-3 rounded bg-white/10 overflow-hidden">
              <div
                className="h-full rounded"
                style={{ width: `${pct}%`, backgroundColor: "#3b82f6" }}
              />
            </div>
            <div className="w-20 text-right tabular-nums">{r.count.toLocaleString()}</div>
          </div>
        );
      })}
      <div className="pt-1 text-xs opacity-70">Total: {total.toLocaleString()}</div>
    </div>
  );
}
