// src/app/dashboard/page.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  CardMedia,
} from "@mui/material";
import { Users, Clock, Globe } from "lucide-react";

import { StatCard } from "./components/StatCard";
import { PendingList } from "./components/PendingList";
import { LocationChart } from "./components/LocationChart";
import { LicenseChart } from "./components/LicenseChart";
import { RegistrationTrendChart } from "./components/RegistrationTrendChart";

export default function DashboardHome() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: totalData } = useQuery<{ total: number }>({
    queryKey: ["total"],
    queryFn: () => fetch("/api/contractors/count").then((r) => r.json()),
  });
  const { data: pendingData } = useQuery<[]>({
    queryKey: ["pending"],
    queryFn: () => fetch("/api/contractors/pending").then((r) => r.json()),
  });
  const { data: locData } = useQuery<[]>({
    queryKey: ["by-location"],
    queryFn: () => fetch("/api/contractors/by-location").then((r) => r.json()),
  });
  const { data: licData } = useQuery<[]>({
    queryKey: ["licenses"],
    queryFn: () =>
      fetch("/api/contractors/licenses-by-type").then((r) => r.json()),
  });
  const { data: trendData } = useQuery<[]>({
    queryKey: ["trend"],
    queryFn: () =>
      fetch(
        `/api/contractors/registrations-over-time?from=2025-01-01&to=${today}`
      ).then((r) => r.json()),
  });

  if (
    !totalData ||
    !pendingData ||
    !locData ||
    !licData ||
    !trendData
  ) {
    return <Typography>Loading dashboard…</Typography>;
  }

  return (
    <div className="space-y-8 px-4 md:px-8 lg:px-16">
      {/* —— Top row: StatCards —— */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Total Contractors"
          value={totalData.total}
          Icon={Users}
        />
        <StatCard
          label="Pending Registrations"
          value={pendingData.length}
          Icon={Clock}
        />
        <StatCard
          label="Active Contractors"
          value={totalData.total - pendingData.length}
          Icon={Globe}
        />
      </div>

      {/* —— Second row: charts & list —— */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="outlined" className="h-full">
          <CardHeader title="Contractors by Location" />
          <Divider />
          <CardContent>
            <LocationChart data={locData} />
          </CardContent>
        </Card>

        <Card variant="outlined" className="h-full">
          <CardHeader title="Licenses by Type" />
          <Divider />
          <CardContent>
            <LicenseChart data={licData} />
          </CardContent>
        </Card>

        <Card variant="outlined" className="h-full">
          <CardHeader title="Registrations Over Time" />
          <Divider />
          <CardContent>
            <RegistrationTrendChart data={trendData} />
          </CardContent>
        </Card>

        <Card variant="outlined" className="h-full">
          <CardHeader title="Pending Registrations" />
          <Divider />
          <CardContent>
            <PendingList items={pendingData} />
          </CardContent>
        </Card>

        <Card variant="outlined" className="h-full">
          <CardHeader title="HeatMap of Contractors" />
          <Divider />
          <CardContent>
            <CardMedia
          component="img"
          src="/heatmap.png"
          alt="Contractors Heatmap"
          className="object-cover w-full h-full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
