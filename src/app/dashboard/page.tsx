// src/app/dashboard/page.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Skeleton,
  Chip,
} from "@mui/material";
import { Users, Globe } from "lucide-react";

import { StatCard } from "./components/StatCard";
import { RegistrationTrendChart } from "./components/RegistrationTrendChart";
import Donut from "./components/Donut";
import { TopNBar } from "./components/TopNBar";
import { RegionDensityList } from "./components/RegionDensityList";
import { RegionTreemap } from "./components/RegionTreemap";

type CountResp = { total: number };
type RegionItem = { location: string; count: number };
type IndustryItem = { type: string; count: number };
type TrendPoint = { date: string; count: number };
type Contractor = {
  id: number;
  name?: string | null;
  gender?: string | null;
  age?: number | null;
  region?: string | null;
  industryType?: string | null;
  createdAt: string;
};

const CARD_SX = {
  borderRadius: 2,
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
};

// helper to make “Top N + Others”
function topNWithOthers<T>(
  rows: T[],
  n: number,
  labelOf: (r: T) => string,
  countOf: (r: T) => number
) {
  const sorted = [...rows].sort((a, b) => countOf(b) - countOf(a));
  const top = sorted.slice(0, n).map((r) => ({ label: labelOf(r), count: countOf(r) }));
  const rest = sorted.slice(n);
  const others = rest.reduce((s, r) => s + countOf(r), 0);
  return others > 0 ? [...top, { label: "Others", count: others }] : top;
}

export default function DashboardHome() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: totalData, isLoading: l1 } = useQuery<CountResp>({
    queryKey: ["total"],
    queryFn: () => fetch("/api/contractors/count").then((r) => r.json()),
  });

  const { data: locData, isLoading: l2 } = useQuery<RegionItem[]>({
    queryKey: ["by-region"],
    queryFn: () => fetch("/api/contractors/by-region").then((r) => r.json()),
  });

  const { data: indData, isLoading: l3 } = useQuery<IndustryItem[]>({
    queryKey: ["by-industry"],
    queryFn: () => fetch("/api/contractors/by-industry").then((r) => r.json()),
  });

  const { data: trendData, isLoading: l4 } = useQuery<TrendPoint[]>({
    queryKey: ["joined-over-time", today],
    queryFn: () =>
      fetch(`/api/contractors/joined-over-time?from=2025-01-01&to=${today}`).then((r) =>
        r.json()
      ),
  });

  const { data: all, isLoading: l5 } = useQuery<Contractor[]>({
    queryKey: ["contractors-for-cards"],
    queryFn: () => fetch("/api/contractors").then((r) => r.json()),
  });

  const loading = l1 || l2 || l3 || l4 || l5;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} elevation={0} sx={CARD_SX} className="h-[110px]">
              <CardContent className="h-full flex items-center gap-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton width="60%" />
                  <Skeleton width="40%" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton variant="rectangular" height={320} />
        <Skeleton variant="rectangular" height={320} />
      </div>
    );
  }

  if (!totalData || !locData || !indData || !trendData || !all) {
    return <Typography color="text.secondary">No data available.</Typography>;
  }

  // demographics
  const g = (x?: string | null) => (x ?? "").trim().toUpperCase();
  const male = all.filter((c) => g(c.gender).startsWith("M")).length;
  const female = all.filter((c) => g(c.gender).startsWith("F")).length;
  const otherGender = Math.max(0, totalData.total - male - female);

  const ageKnown = all.filter((c) => typeof c.age === "number") as Required<
    Pick<Contractor, "age">
  >[];
  const under40 = ageKnown.filter((c: any) => c.age < 40).length;
  const overEq40 = ageKnown.filter((c: any) => c.age >= 40).length;
  const ageUnknown = totalData.total - (under40 + overEq40);

  const genderData = [
    { label: "Male", count: male },
    { label: "Female", count: female },
    { label: "Other/Unknown", count: otherGender },
  ];
  const ageData = [
    { label: "Age < 40", count: under40 },
    { label: "Age ≥ 40", count: overEq40 },
    { label: "Unknown", count: ageUnknown },
  ];

  // cards meta
  const totalRegions = locData.length;
  const totalIndustries = indData.length;
  const topRegion = [...locData].sort((a, b) => b.count - a.count)[0]?.location ?? "—";

  // visuals
  const regionTop10 = topNWithOthers(locData, 10, (r) => r.location, (r) => r.count);
  const industryTop12 = topNWithOthers(indData, 12, (r) => r.type, (r) => r.count);

  // normalized items for treemap (fixes single-rect bug)
  const treemapItems = locData
    .filter((r) => r.count > 0)
    .map((r) => ({ name: r.location, value: r.count }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            As of {new Date().toLocaleString()}
          </Typography>
        </div>
        <div className="hidden sm:flex gap-2">
          <Chip size="small" label={`Top region: ${topRegion}`} />
          <Chip size="small" label={`Regions: ${totalRegions}`} />
          <Chip size="small" label={`Industries: ${totalIndustries}`} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Members" value={totalData.total} Icon={Users} />
        <StatCard label="Regions Covered" value={totalRegions} Icon={Globe} />
        <StatCard label="Industries" value={totalIndustries} />
      </div>

      {/* Demographics */}
      <section className="space-y-3">
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          DEMOGRAPHICS
        </Typography>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card elevation={0} sx={CARD_SX}>
            <CardHeader title="Gender Distribution" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Donut data={genderData} />
              </Box>
            </CardContent>
          </Card>

          <Card elevation={0} sx={CARD_SX}>
            <CardHeader title="Age Distribution" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Donut data={ageData} />
              </Box>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Geography */}
      <section className="space-y-3">
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          GEOGRAPHY
        </Typography>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TopN (not a duplicate anymore) */}
          <Card elevation={0} sx={CARD_SX}>
            <CardHeader
              title="Top Regions (Top 10)"
              subheader="Most represented locations with Others aggregated"
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 320 }}>
                <TopNBar data={regionTop10} />
              </Box>
            </CardContent>
          </Card>

          {/* Full ranked list */}
          <Card elevation={0} sx={CARD_SX}>
            <CardHeader
              title="Region Density (Ranked List)"
              subheader="Relative volume by location"
            />
            <Divider />
            <CardContent>
              <RegionDensityList data={locData} />
            </CardContent>
          </Card>
        </div>

        {/* Treemap with normalized items */}
        <Card elevation={0} sx={CARD_SX}>
          <CardHeader title="Geographic Concentration (Treemap)" />
          <Divider />
          <CardContent>
            <RegionTreemap data={treemapItems} />
          </CardContent>
        </Card>
      </section>

      {/* Activity */}
      <section className="space-y-3">
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          ACTIVITY
        </Typography>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card elevation={0} sx={CARD_SX}>
            <CardHeader
              title="Top Industries (Top 12)"
              subheader="Largest industry groups with Others aggregated"
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 320 }}>
                <TopNBar data={industryTop12} />
              </Box>
            </CardContent>
          </Card>

          <Card elevation={0} sx={CARD_SX}>
            <CardHeader title="Registrations Over Time" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <RegistrationTrendChart data={trendData} />
              </Box>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
