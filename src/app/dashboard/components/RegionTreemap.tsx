// src/app/dashboard/components/RegionTreemap.tsx
"use client";
import React from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

type Item = { name: string; value: number };

export function RegionTreemap({ data }: { data: Item[] }) {
  // Recharts Treemap expects a flat array with { name, value }
  const palette = [
    "#60A5FA",
    "#34D399",
    "#FBBF24",
    "#F472B6",
    "#A78BFA",
    "#22D3EE",
    "#F97316",
    "#E879F9",
  ];

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <Treemap
          data={data}
          dataKey="value"
          stroke="rgba(255,255,255,0.12)"
          aspectRatio={4 / 1.8}
          content={({ x, y, width, height, index, name, value }: any) => {
            if (width <= 0 || height <= 0) return null;
            const fill = palette[index % palette.length];
            return (
              <g>
                <rect x={x} y={y} width={width} height={height} fill={fill} rx={8} ry={8} />
                {width > 80 && height > 26 && (
                  <text x={x + 8} y={y + 18} fill="rgba(0,0,0,0.8)" fontSize={12}>
                    {name}
                  </text>
                )}
                {width > 60 && height > 26 && (
                  <text x={x + 8} y={y + 34} fill="rgba(0,0,0,0.6)" fontSize={11}>
                    {value}
                  </text>
                )}
              </g>
            );
          }}
        >
          <Tooltip
            formatter={(v: any) => String(v)}
            itemStyle={{ color: "#fff" }}
            contentStyle={{
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
