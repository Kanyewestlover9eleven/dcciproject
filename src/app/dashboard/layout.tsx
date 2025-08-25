// src/app/dashboard/layout.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Users, Activity, FileText, Mail } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Typography } from "@mui/material";

const queryClient = new QueryClient();

const navItems = [
  { label: "Home",           href: "/dashboard",               icon: Home },
  { label: "Members",        href: "/dashboard/contractors",   icon: Users },
  { label: "Registrations",  href: "/dashboard/registrations", icon: Activity },
  { label: "Reports",        href: "/dashboard/reports",       icon: FileText },
  { label: "Blast",          href: "/dashboard/blast",         icon: Mail },
];

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#0ea5e9" },
    background: { default: "#0f172a", paper: "#0b1220" },
    text: { primary: "#e5e7eb", secondary: "#94a3b8" },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundColor: "#0b1220" } } },
  },
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <div className="flex min-h-screen overflow-x-hidden">
            {/* FIXED SIDEBAR (doesn't take layout width) */}
            <aside
              className="fixed top-0 left-0 bottom-0 w-[280px] px-6 py-6"
              style={{ backgroundColor: "#0b1220", borderRight: "1px solid rgba(148,163,184,.12)" }}
            >
              <Link href="/dashboard" className="flex items-center mb-8 gap-3">
                <Image src="/dcci.png" alt="Logo" width={40} height={40} />
                <div>
                  <div className="text-sm font-semibold tracking-wide">DCCI Dashboard</div>
                  <div className="text-xs text-slate-400">Administration</div>
                </div>
              </Link>

              <nav className="space-y-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                        ${isActive ? "bg-sky-900/40 text-white" : "text-slate-300 hover:bg-slate-800/50"}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Quick Calendar */}
              <div className="mt-8 p-4 rounded-2xl bg-slate-900/40 overflow-hidden">
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                  Quick Calendar
                </Typography>
                <DateCalendar
                  showDaysOutsideCurrentMonth
                  sx={{
                    width: "100%",
                    minWidth: 0,
                    "& .MuiPickersCalendarHeader-root": { px: 0 },
                    "& .MuiDayCalendar-header": { mx: 0 },
                    "& .MuiPickersDay-root": { mx: 0.25 },
                    "& .Mui-selected": { bgcolor: "primary.main !important" },
                  }}
                />
              </div>

              <div className="mt-auto text-xs text-slate-500 pt-6">© {new Date().getFullYear()} DCCI</div>
            </aside>

            {/* SPACER to offset the fixed rail (takes layout width) */}
            <div className="w-[280px] flex-shrink-0" />

            {/* MAIN (no extra left margin anymore) */}
            <main className="flex-1 min-w-0 px-8 py-8 max-w-screen-2xl mx-auto">
              {children}
            </main>
          </div>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
