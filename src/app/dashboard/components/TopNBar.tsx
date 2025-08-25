// src/app/dashboard/components/TopNBar.tsx
"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { useTheme } from "@mui/material/styles";

type Row = { label: string; count: number };

export function TopNBar({ data, height = 320 }: { data: Row[]; height?: number }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const axis = "rgba(255,255,255,0.82)";
  const grid = "rgba(255,255,255,0.12)";
  const track = "rgba(255,255,255,0.08)";

  const rows = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.count));
    const sorted = [...data].sort((a, b) => b.count - a.count);
    return sorted.map((d) => ({ ...d, __max: max }));
  }, [data]);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 8, right: 28, left: 24, bottom: 8 }}
        >
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis
            type="category"
            dataKey="label"
            width={160}
            tick={{ fill: axis, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: grid }}
          />

          {/* Background track */}
          <Bar dataKey="__max" fill={track} radius={[10, 10, 10, 10]} barSize={16} />

          {/* Value bar */}
          <Bar dataKey="count" fill={primary} radius={[10, 10, 10, 10]} barSize={16}>
            <LabelList
              dataKey="count"
              position="right"
              formatter={(v: any) => v.toLocaleString()}
              style={{ fill: axis, fontSize: 12 }}
            />
          </Bar>

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            contentStyle={{
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
            }}
            labelStyle={{ color: "#fff" }}
            formatter={(value: any) => [value, "Members"]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
