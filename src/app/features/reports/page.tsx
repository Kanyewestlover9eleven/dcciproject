// src/features/reports/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography, Paper, Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Chip,
} from "@mui/material";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

type AggRow = { label: string; count: number };
type TSRow  = { date: string; count: number };

const COLORS = ["#6366F1","#10B981","#F59E0B","#EF4444","#8B5CF6","#3B82F6","#14B8A6","#F472B6"];

const formatDate = (d: Date) => d.toISOString().slice(0, 10);

export default function ReportsFeaturePage() {
  // Controls
  const [from, setFrom] = useState<string>("");
  const [to,   setTo]   = useState<string>("");
  const [groupBy, setGroupBy] = useState<"region"|"industryType"|"gender"|"status"|"ageBand">("region");
  const [chart, setChart]     = useState<"bar"|"pie">("bar");
  const [granularity, setGranularity] = useState<"day"|"month"|"year">("month");

  // Filters
  const [status, setStatus] = useState<string[]>([]);
  const [gender, setGender] = useState<string[]>([]);
  const [region, setRegion] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState<string>("");
  const [ageMax, setAgeMax] = useState<string>("");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    p.set("groupBy", groupBy);
    if (status.length) p.set("status", status.join(","));
    if (gender.length) p.set("gender", gender.join(","));
    if (region.length) p.set("region", region.join(","));
    if (industry.length) p.set("industryType", industry.join(","));
    if (ageMin) p.set("ageMin", ageMin);
    if (ageMax) p.set("ageMax", ageMax);
    return p.toString();
  }, [from, to, groupBy, status, gender, region, industry, ageMin, ageMax]);

  const { data: agg = [], isLoading: aggLoading } = useQuery<AggRow[]>({
    queryKey: ["report-aggregate", qs],
    queryFn: () => fetch(`/api/reports/aggregate?${qs}`).then(r => r.json()).then(j => j.data),
  });

  const { data: ts = [], isLoading: tsLoading } = useQuery<TSRow[]>({
    queryKey: ["report-timeseries", from, to, granularity],
    queryFn: () => fetch(`/api/reports/timeseries?from=${from}&to=${to}&granularity=${granularity}`)
      .then(r => r.json()).then(j => j.data),
  });

  const handleExport = () => {
    window.open(`/api/reports/export?${qs}`, "_blank");
  };

  return (
    <Box className="space-y-8">
      <Typography variant="h4">Reports</Typography>

      {/* Controls */}
      <Paper className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TextField label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="To"   type="date" value={to}   onChange={(e) => setTo(e.target.value)}   InputLabelProps={{ shrink: true }} />

        <FormControl>
          <InputLabel id="groupBy">Group By</InputLabel>
          <Select labelId="groupBy" label="Group By" value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)}>
            <MenuItem value="region">Region</MenuItem>
            <MenuItem value="industryType">Industry</MenuItem>
            <MenuItem value="gender">Gender</MenuItem>
            <MenuItem value="status">Status</MenuItem>
            <MenuItem value="ageBand">Age Band</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel id="chartType">Chart</InputLabel>
          <Select labelId="chartType" label="Chart" value={chart} onChange={(e) => setChart(e.target.value as any)}>
            <MenuItem value="bar">Bar</MenuItem>
            <MenuItem value="pie">Pie</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel id="gran">Time Granularity</InputLabel>
          <Select labelId="gran" label="Time Granularity" value={granularity} onChange={(e) => setGranularity(e.target.value as any)}>
            <MenuItem value="day">Day</MenuItem>
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="year">Year</MenuItem>
          </Select>
        </FormControl>

        <div className="flex items-center gap-2">
          <TextField label="Age ≥" type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
          <TextField label="Age ≤" type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
        </div>

        <TagInput label="Status (comma)"   value={status}   onChange={setStatus}   placeholder="ACTIVE, INACTIVE, DECEASED" />
        <TagInput label="Gender (comma)"   value={gender}   onChange={setGender}   placeholder="M, F" />
        <TagInput label="Region (comma)"   value={region}   onChange={setRegion}   placeholder="Kuching, Miri" />
        <TagInput label="Industry (comma)" value={industry} onChange={setIndustry} placeholder="Construction, Oil & Gas" />

        <div className="col-span-full">
          <Button variant="contained" onClick={handleExport}>Export CSV</Button>
        </div>
      </Paper>

      {/* Aggregate chart */}
      <Paper className="p-6">
        <Typography variant="h6" gutterBottom>
          {`Aggregate by ${groupBy}`}
        </Typography>
        {aggLoading ? (
          <Typography>Loading…</Typography>
        ) : chart === "bar" ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agg}>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={agg} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={100} label>
                {agg.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Time series */}
      <Paper className="p-6">
        <Typography variant="h6" gutterBottom>New Registrations Over Time</Typography>
        {tsLoading ? (
          <Typography>Loading…</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ts}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3f51b5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
}

function TagInput({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(value.join(", "));
  return (
    <div>
      <TextField
        label={label}
        value={raw}
        onChange={(e) => {
          const v = e.target.value;
          setRaw(v);
          const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
          onChange(parts);
        }}
        placeholder={placeholder}
        fullWidth
      />
      {value.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {value.map((v) => <Chip key={v} label={v} size="small" />)}
        </div>
      )}
    </div>
  );
}
