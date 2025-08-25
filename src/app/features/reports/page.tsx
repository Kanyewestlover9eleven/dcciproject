// src/features/reports/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Tooltip,
  Collapse,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // Grid v2 (size={{ xs, md }})
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

type AggRow = { label: string; count: number };
type TSRow = { date: string; count: number };

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#14B8A6", "#F472B6"];
const fmt = (n: number) => n.toLocaleString();

const todayStr = new Date().toISOString().slice(0, 10);
const ytdStr = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);

export default function ReportsFeaturePage() {
  const qc = useQueryClient();

  // Controls
  const [from, setFrom] = useState<string>(ytdStr);
  const [to, setTo] = useState<string>(todayStr);
  const [groupBy, setGroupBy] = useState<"region" | "industryType" | "gender" | "status" | "ageBand">("region");
  const [chart, setChart] = useState<"bar" | "pie">("bar");
  const [granularity, setGranularity] = useState<"day" | "month" | "year">("month");
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    queryFn: () => fetch(`/api/reports/aggregate?${qs}`).then((r) => r.json()).then((j) => j.data),
  });

  const { data: ts = [], isLoading: tsLoading } = useQuery<TSRow[]>({
    queryKey: ["report-timeseries", from, to, granularity],
    queryFn: () =>
      fetch(`/api/reports/timeseries?from=${from}&to=${to}&granularity=${granularity}`)
        .then((r) => r.json())
        .then((j) => j.data),
  });

  // Derived
  const total = useMemo(() => agg.reduce((s, a) => s + (a?.count ?? 0), 0), [agg]);
  const top = useMemo(() => agg.slice().sort((a, b) => b.count - a.count)[0], [agg]);

  const activeChips = [
    ...status.map((v) => ({ k: "Status", v })),
    ...region.map((v) => ({ k: "Region", v })),
    ...industry.map((v) => ({ k: "Industry", v })),
    ...(showAdvanced ? gender.map((v) => ({ k: "Gender", v })) : []),
    ...(showAdvanced && ageMin ? [{ k: "Age ≥", v: ageMin }] : []),
    ...(showAdvanced && ageMax ? [{ k: "Age ≤", v: ageMax }] : []),
  ];

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["report-aggregate"] });
    qc.invalidateQueries({ queryKey: ["report-timeseries"] });
  };

  return (
    <Box className="space-y-6">
      {/* Page header */}
      <Box className="flex items-center justify-between">
        <Typography variant="h4">Reports</Typography>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => {
              setFrom(ytdStr);
              setTo(todayStr);
              setGroupBy("region");
              setChart("bar");
              setGranularity("month");
              setStatus([]);
              setGender([]);
              setRegion([]);
              setIndustry([]);
              setAgeMin("");
              setAgeMax("");
              refresh();
            }}
          >
            Reset
          </Button>
          <Button variant="contained" onClick={() => window.open(`/api/reports/export?${qs}`, "_blank")}>
            Export CSV
          </Button>
        </div>
      </Box>

      {/* KPI row */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Total in Range
            </Typography>
            <Typography variant="h4">{fmt(total)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {from || "—"} → {to || "—"}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Grouped By
            </Typography>
            <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
              {groupBy}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Buckets: {agg.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Top Bucket
            </Typography>
            <Typography variant="h6">{top ? `${top.label}` : "—"}</Typography>
            <Typography variant="caption" color="text.secondary">
              {top ? fmt(top.count) : "No data"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="From"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="To"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="groupBy">Group By</InputLabel>
              <Select
                labelId="groupBy"
                label="Group By"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
              >
                <MenuItem value="region">Region</MenuItem>
                <MenuItem value="industryType">Industry</MenuItem>
                <MenuItem value="gender">Gender</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="ageBand">Age Band</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="chartType">Chart</InputLabel>
              <Select labelId="chartType" label="Chart" value={chart} onChange={(e) => setChart(e.target.value as any)}>
                <MenuItem value="bar">Bar</MenuItem>
                <MenuItem value="pie">Pie</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="gran">Time Granularity</InputLabel>
              <Select
                labelId="gran"
                label="Time Granularity"
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as any)}
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Quick ranges */}
          <Grid size={{ xs: 12, md: 9 }} className="flex items-end gap-2">
            <Tooltip title="From first day of this month to today">
              <Button
                size="small"
                onClick={() => {
                  const d = new Date();
                  const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
                  setFrom(mStart);
                  setTo(todayStr);
                }}
              >
                This Month
              </Button>
            </Tooltip>
            <Tooltip title="Year to date">
              <Button size="small" onClick={() => { setFrom(ytdStr); setTo(todayStr); }}>
                YTD
              </Button>
            </Tooltip>
            <Tooltip title="Clear dates (all time)">
              <Button size="small" onClick={() => { setFrom(""); setTo(""); }}>
                All Time
              </Button>
            </Tooltip>
            <Button size="small" variant="outlined" onClick={refresh}>
              Refresh
            </Button>
          </Grid>

          {/* Simple filters */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TagInput label="Status" value={status} onChange={setStatus} placeholder="ACTIVE, INACTIVE, DECEASED" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TagInput label="Region" value={region} onChange={setRegion} placeholder="Kuching, Miri" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TagInput label="Industry" value={industry} onChange={setIndustry} placeholder="Construction, Oil & Gas" />
          </Grid>

          {/* Advanced */}
          <Grid size={{ xs: 12 }}>
            <Button size="small" onClick={() => setShowAdvanced((v) => !v)}>
              {showAdvanced ? "Hide advanced filters" : "Show advanced filters"}
            </Button>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Collapse in={showAdvanced} unmountOnExit>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TagInput label="Gender" value={gender} onChange={setGender} placeholder="M, F" />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField
                    label="Age ≥"
                    type="number"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField
                    label="Age ≤"
                    type="number"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Grid>

          {/* Active chips */}
          {activeChips.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1.5 }} />
              <div className="flex flex-wrap gap-1">
                {activeChips.map((c, i) => (
                  <Chip key={`${c.k}-${c.v}-${i}`} label={`${c.k}: ${c.v}`} size="small" />
                ))}
                <Button
                  size="small"
                  onClick={() => {
                    setStatus([]); setGender([]); setRegion([]); setIndustry([]); setAgeMin(""); setAgeMax("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Aggregate chart */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {`Aggregate by ${groupBy}`}
        </Typography>
        {aggLoading ? (
          <Typography>Loading…</Typography>
        ) : agg.length === 0 ? (
          <Typography color="text.secondary">No data for the selected range/filters.</Typography>
        ) : chart === "bar" ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={agg}>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Legend />
              <Bar dataKey="count" name="Count" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={agg} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={110} label>
                {agg.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <ReTooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Time series */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          New Registrations Over Time
        </Typography>
        {tsLoading ? (
          <Typography>Loading…</Typography>
        ) : ts.length === 0 ? (
          <Typography color="text.secondary">No data for the selected period.</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ts}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Registrations" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
}

/* --- Local TagInput (chips + CSV input) --------------------- */
function TagInput({
  label,
  value,
  onChange,
  placeholder,
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
          const parts = v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          onChange(parts);
        }}
        placeholder={placeholder}
        fullWidth
      />
      {value.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {value.map((v) => (
            <Chip key={`${label}-${v}`} label={v} size="small" />
          ))}
        </div>
      )}
    </div>
  );
}
