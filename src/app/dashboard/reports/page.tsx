// src/app/dashboard/reports/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Paper,
  Box,
  Button,
  TextField,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type RegistrationReport = { date: string; count: number }[];
type CategoryReport     = { category: string; count: number }[];

// Utility to format Date → YYYY-MM-DD
function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  // Date range state
  const [from, setFrom] = useState<string>(formatDate(new Date(Date.now() - 7 * 86400000)));
  const [to,   setTo]   = useState<string>(formatDate(new Date()));

  // 2) Registrations over time
  const { data: regData = [], isLoading: regLoading } = useQuery<RegistrationReport>({
    queryKey: ["report", "registrations", from, to],
    queryFn: () =>
      fetch(`/api/reports/registrations?from=${from}&to=${to}`)
        .then((r) => r.json())
        .then((json) => json.data),
  });

  // 3) Contractors by category
  const { data: catData = [], isLoading: catLoading } = useQuery<CategoryReport>({
    queryKey: ["report", "byCategory"],
    queryFn: () =>
      fetch(`/api/reports/by-category`)
        .then((r) => r.json())
        .then((json) => json.data),
  });

  // 4) Export CSV
  const handleExport = () => {
    window.open(`/api/reports/export?from=${from}&to=${to}`, "_blank");
  };

  return (
    <Box className="space-y-8">
      <Typography variant="h4">Reports</Typography>

      {/* Date Range Filters + Export */}
      <Paper className="p-6 flex flex-wrap items-center gap-4">
        <TextField
          label="From"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleExport}>
          Export CSV
        </Button>
      </Paper>

      {/* New Registrations Over Time */}
      <Paper className="p-6">
        <Typography variant="h6" gutterBottom>
          New Registrations Over Time
        </Typography>
        {regLoading ? (
          <Typography>Loading chart…</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={regData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3f51b5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Contractors by Category */}
      <Paper className="p-6">
        <Typography variant="h6" gutterBottom>
          Contractors by Category
        </Typography>
        {catLoading ? (
          <Typography>Loading chart…</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={catData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
}
