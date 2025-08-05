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

const queryClient = new QueryClient();

const navItems = [
  { label: "Home",       href: "/dashboard",          icon: Home },
  { label: "Members",    href: "/dashboard/contractors", icon: Users },
  { label: "Activities", href: "/dashboard/activities", icon: Activity },
  { label: "Reports",    href: "/dashboard/reports",    icon: FileText },
  { label: "Support",    href: "/dashboard/support",    icon: Mail },
];

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#003554" },
    background: { default: "#003554", paper: "#003554" },
    text:       { primary: "#fff",    secondary: "#ccc" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundColor: "#004d66" },
      },
    },
  },
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="flex-shrink-0 flex flex-col w-64 p-6" style={{ backgroundColor: "#003554" }}>
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center mb-10">
                <Image src="/dcci.png" alt="Logo" width={80} height={80} className="mr-3" />
                <span className="text-xl font-extrabold tracking-tight text-white">
                  DCCI DASHBOARD
                </span>
              </Link>

              {/* Nav + Calendar */}
              <nav className="flex-1 space-y-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const isActive = pathname === href;

                  return (
                    <React.Fragment key={href}>
                      <Link
                        href={href}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-lg transition
                          ${isActive
                            ? "bg-blue-700 text-white shadow"
                            : "text-gray-300 hover:bg-blue-800"}
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{label}</span>
                      </Link>

                      {/* calendar now renders _after_ the Support link */}
                      {href === "/dashboard/support" && (
                        <div className="mt-4 px-2 w-full max-h-[240px] overflow-auto">
                          <DateCalendar
                            showDaysOutsideCurrentMonth
                            sx={{
                              width: "90%",
                              "& .MuiTypography-root":  { color: "#fff" },
                              "& .Mui-selected":        { backgroundColor: "#005a75 !important" },
                              "& .MuiPickersDay-root":  { color: "#fff" },
                              "& .MuiCalendarPicker-root": { backgroundColor: "#003554" },
                            }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="mt-auto pt-6 text-xs text-gray-400">
                © {new Date().getFullYear()} DCCI
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-grow min-w-0 p-8 max-w-screen-xl mx-auto">
              {children}
            </main>
          </div>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
