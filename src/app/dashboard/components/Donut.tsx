// src/app/dashboard/components/Donut.tsx
"use client";
import { useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export type DonutDatum = { label: string; count: number };

const PALETTE = ["#7C8CFF","#4CC9F0","#F72585","#43AA8B","#F8961E","#90BE6D","#577590"];

export default function Donut({
  data,
  height = 320,
  onSliceClick,
}: {
  data: DonutDatum[];
  height?: number;
  onSliceClick?: (label: string) => void;
}) {
  const total = useMemo(() => data.reduce((a, d) => a + d.count, 0), [data]);
  const [active, setActive] = useState<string | null>(null);

  return (
    <div style={{ width: "100%", height, position: "relative" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={1}
            labelLine={false}
            isAnimationActive
            onMouseEnter={(p) => setActive((p?.name as string) || null)}
            onMouseLeave={() => setActive(null)}
            onClick={(p) => onSliceClick?.(p?.name as string)}
          >
            {data.map((d, i) => (
              <Cell
                key={d.label}
                fill={PALETTE[i % PALETTE.length]}
                opacity={active && active !== d.label ? 0.6 : 1}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: any, _n, item: any) => {
              const pct = total ? Math.round((Number(v) / total) * 100) : 0;
              return [`${v} (${pct}%)`, item?.name];
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center total */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ textAlign: "center", lineHeight: 1.2 }}>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Total</div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{total}</div>
        </div>
      </div>
    </div>
  );
}
