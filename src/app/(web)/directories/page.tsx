// src/app/(web)/directories/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type Contractor = {
  id: number;
  name?: string | null;
  companyName?: string | null;
  location?: string | null;
  email?: string | null;
  address?: string | null;
  category?: string | null;
};

const STAFF = [
  "Dr. Carolina Sandra Giang, DCCI Manager",
  "Mr. Terence Temenggong Jayang, Executive Secretary",
  "Mr. George Gawing, Operations Officer",
  "Ms. Yvonne Isabelle Joshua, Asst. Executive (Capacity Building & Events)",
  "Ms. Cecelia Robert Aling, Asst. Executive (Membership & HR)",
  "Ms. Nancy Ngang, Administrative Assistant",
  "Mdm. Manggu Jimbau, Housekeeping & Office Support",
];

type Tab = "members" | "staff";

export default function DirectoriesPage() {
  const [tab, setTab] = useState<Tab>("members");

  // ----- member state -----
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortKey] = useState<"name" | "companyName" | "location">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/contractors")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load contractors");
        return r.json();
      })
      .then((data: Contractor[]) =>
        setContractors(
          data.map((c) => ({
            id: c.id,
            name: c.name ?? "",
            companyName: c.companyName ?? "",
            location: c.location ?? "",
            email: c.email ?? "",
            address: c.address ?? "",
            category: c.category ?? "",
          }))
        )
      )
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return contractors
      .filter((c) => {
        const nm = (c.name || c.companyName || "").toLowerCase();
        return nm.includes(term);
      })
      .filter((c) =>
        companyFilter
          ? (c.companyName ?? "").toLowerCase().includes(companyFilter.trim().toLowerCase())
          : true
      )
      .filter((c) =>
        locationFilter
          ? (c.location ?? "").toLowerCase().includes(locationFilter.trim().toLowerCase())
          : true
      )
      .sort((a, b) => {
        const av = (a[sortKey] ?? "").toLowerCase();
        const bv = (b[sortKey] ?? "").toLowerCase();
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [contractors, search, companyFilter, locationFilter, sortKey, sortDir]);

  // ---------- UI ----------
  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <h1 className="text-3xl font-bold text-center">Directories</h1>

        {/* Tabs */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setTab("members")}
            className={`px-4 py-2 rounded ${
              tab === "members" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setTab("staff")}
            className={`px-4 py-2 rounded ${
              tab === "staff" ? "bg-blue-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            Staff
          </button>
        </div>

        {/* MEMBERS TAB */}
        {tab === "members" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <input
                className="flex-1 min-w-[180px] px-3 py-2 border rounded"
                placeholder="Search by name or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <input
                className="px-3 py-2 border rounded min-w-[150px]"
                placeholder="Filter by company…"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
              />
              <input
                className="px-3 py-2 border rounded min-w-[150px]"
                placeholder="Filter by location…"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />

              <div className="flex items-center gap-2">
                <select
                  className="px-2 py-1 border rounded"
                  value={sortKey}
                >
                  <option value="name">Name</option>
                  <option value="companyName">Company</option>
                  <option value="location">Location</option>
                </select>
                <button
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  {sortDir === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            {/* Cards */}
            <ul className="space-y-4">
              {filtered.map((c) => {
                const displayName = c.name || c.companyName || "Unknown";
                return (
                  <li key={c.id} className="border rounded-lg p-4 shadow bg-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-semibold text-lg">{displayName}</h2>
                        <p className="text-gray-600">
                          {c.companyName} — {c.location}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedId((id) => (id === c.id ? null : c.id))
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {expandedId === c.id ? "Hide Details" : "View Details"}
                      </button>
                    </div>

                    {expandedId === c.id && (
                      <div className="mt-3 text-gray-700 space-y-1">
                        <p>
                          <strong>Email:</strong> {c.email || "-"}
                        </p>
                        <p>
                          <strong>Address:</strong> {c.address || "-"}
                        </p>
                        <p>
                          <strong>Category:</strong>{" "}
                          {c.category
                            ? c.category.charAt(0).toUpperCase() + c.category.slice(1)
                            : "-"}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}

              {filtered.length === 0 && (
                <li className="text-center text-gray-500 py-8">
                  No contractors found.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* STAFF TAB */}
        {tab === "staff" && (
          <div className="bg-white rounded shadow divide-y">
            {STAFF.map((s) => (
              <div key={s} className="p-4">
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
