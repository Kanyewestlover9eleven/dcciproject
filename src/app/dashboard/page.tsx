"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card, CardHeader, CardContent, Typography, Divider, CardMedia,
} from "@mui/material";
import { Users, Globe } from "lucide-react";

import { StatCard } from "./components/StatCard";
import { LocationChart } from "./components/LocationChart";
import { LicenseChart } from "./components/LicenseChart";
import { RegistrationTrendChart } from "./components/RegistrationTrendChart";
import { GenderChart } from "./components/GenderChart";
import { AgeChart } from "./components/AgeChart";

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

export default function DashboardHome() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: totalData } = useQuery<CountResp>({
    queryKey: ["total"],
    queryFn: () => fetch("/api/contractors/count").then((r) => r.json()),
  });

  const { data: locData } = useQuery<RegionItem[]>({
    queryKey: ["by-region"],
    queryFn: () => fetch("/api/contractors/by-region").then((r) => r.json()),
  });

  const { data: indData } = useQuery<IndustryItem[]>({
    queryKey: ["by-industry"],
    queryFn: () => fetch("/api/contractors/by-industry").then((r) => r.json()),
  });

  const { data: trendData } = useQuery<TrendPoint[]>({
    queryKey: ["joined-over-time", today],
    queryFn: () =>
      fetch(`/api/contractors/joined-over-time?from=2025-01-01&to=${today}`).then((r) => r.json()),
  });

  const { data: all } = useQuery<Contractor[]>({
    queryKey: ["contractors-for-cards"],
    queryFn: () => fetch("/api/contractors").then((r) => r.json()),
  });

  if (!totalData || !locData || !indData || !trendData || !all) {
    return <Typography>Loading dashboard…</Typography>;
  }

  const g = (x?: string | null) => (x ?? "").trim().toUpperCase();
  const male = all.filter((c) => g(c.gender).startsWith("M")).length;
  const female = all.filter((c) => g(c.gender).startsWith("F")).length;
  const otherGender = Math.max(0, totalData.total - male - female);

  const ageKnown = all.filter((c) => typeof c.age === "number") as Required<Pick<Contractor, "age">>[];
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

  return (
    <div className="space-y-8 px-4 md:px-8 lg:px-16">
      {/* Top: overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Members" value={totalData.total} Icon={Users} />
        <StatCard label="Regions Covered" value={locData.length} Icon={Globe} />
        <StatCard label="Industries" value={indData.length} />
      </div>

      {/* Charts row: Gender + Age */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="outlined" className="h-full">
          <CardHeader title="Gender Distribution" />
          <Divider />
          <CardContent><GenderChart data={genderData} /></CardContent>
        </Card>

        <Card variant="outlined" className="h-full">
          <CardHeader title="Age Distribution" />
          <Divider />
          <CardContent><AgeChart data={ageData} /></CardContent>
        </Card>
      </div>

      {/* Region Heatmap + Region Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="outlined" className="h-full">
          <CardHeader title="Members by Region" />
          <Divider />
          <CardContent><LocationChart data={locData} /></CardContent>
        </Card>
      </div>

      {/* Industry + Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="outlined" className="h-full">
          <CardHeader title="Members by Industry" />
          <Divider />
          <CardContent><LicenseChart data={indData} /></CardContent>
        </Card>

        <Card variant="outlined" className="h-full">
          <CardHeader title="Registrations Over Time" />
          <Divider />
          <CardContent><RegistrationTrendChart data={trendData} /></CardContent>
        </Card>
      </div>

      {/* Keep static heatmap image as fallback (optional) */}
      <Card variant="outlined" className="h-full">
        <CardHeader title="HeatMap (Static Fallback)" />
        <Divider />
        <CardContent>
          <CardMedia component="img" src="/heatmap.png" alt="Members Heatmap" className="object-cover w-full h-full" />
        </CardContent>
      </Card>
    </div>
  );
}
