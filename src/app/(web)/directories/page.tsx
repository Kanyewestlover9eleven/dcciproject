// src/app/(web)/directories/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type Contractor = {
  id: number;
  name?: string | null;
  companyName?: string | null;
  location?: string | null; // from Contractor.region
  email?: string | null;     // parsed from addressEmail
  phone?: string | null;     // parsed from contactFax
  address?: string | null;   // parsed from addressEmail
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
type SortKey = "name" | "companyName" | "location";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const extractEmail = (s?: string | null) => (!s ? "" : s.match(EMAIL_RE)?.[0] ?? "");
const extractAddress = (s?: string | null) =>
  !s ? "" : s.split("•").map(t => t.trim()).filter(Boolean).filter(p => !EMAIL_RE.test(p)).join(" • ");
const extractPhone = (s?: string | null) => (!s ? "" : (s.split("/")[0] || "").trim());

const PAGE_SIZE = 10;

export default function DirectoriesPage() {
  const [tab, setTab] = useState<Tab>("members");

  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // pagination
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/contractors")
      .then(r => {
        if (!r.ok) throw new Error("Failed to load contractors");
        return r.json();
      })
      .then(payload => {
        const raw: any[] = Array.isArray(payload) ? payload : payload?.data ?? [];
        setContractors(
          raw.map(c => ({
            id: c.id,
            name: c.name ?? "",
            companyName: c.companyName ?? "",
            location: c.region ?? c.location ?? "",
            email: extractEmail(c.addressEmail),
            phone: extractPhone(c.contactFax),
            address: extractAddress(c.addressEmail),
          }))
        );
      })
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byName = (c: Contractor) => ((c.name || c.companyName || "") as string).toLowerCase().includes(term);
    const byCompany = (c: Contractor) =>
      companyFilter ? (c.companyName ?? "").toLowerCase().includes(companyFilter.trim().toLowerCase()) : true;
    const byLocation = (c: Contractor) =>
      locationFilter ? (c.location ?? "").toLowerCase().includes(locationFilter.trim().toLowerCase()) : true;

    return contractors
      .filter(byName)
      .filter(byCompany)
      .filter(byLocation)
      .sort((a, b) => {
        const av = ((a[sortKey] ?? "") as string).toLowerCase();
        const bv = ((b[sortKey] ?? "") as string).toLowerCase();
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [contractors, search, companyFilter, locationFilter, sortKey, sortDir]);

  // clamp page when filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (expandedId && !filtered.some(c => c.id === expandedId)) setExpandedId(null);
  }, [filtered.length, totalPages, page, expandedId]);

  const start = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <h1 className="text-3xl font-bold text-center">Directories</h1>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setTab("members")}
            className={`px-4 py-2 rounded ${tab === "members" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            Members
          </button>
          <button
            onClick={() => setTab("staff")}
            className={`px-4 py-2 rounded ${tab === "staff" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            Staff
          </button>
        </div>

        {tab === "members" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <input
                className="flex-1 min-w-[180px] px-3 py-2 border rounded"
                placeholder="Search by name or company…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value ?? "");
                  setPage(1);
                }}
              />
              <input
                className="px-3 py-2 border rounded min-w-[150px]"
                placeholder="Filter by company…"
                value={companyFilter}
                onChange={(e) => {
                  setCompanyFilter(e.target.value ?? "");
                  setPage(1);
                }}
              />
              <input
                className="px-3 py-2 border rounded min-w-[150px]"
                placeholder="Filter by location…"
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value ?? "");
                  setPage(1);
                }}
              />

              <div className="flex items-center gap-2">
                <select
                  className="px-2 py-1 border rounded"
                  value={sortKey}
                  onChange={(e) => {
                    setSortKey((e.target.value as SortKey) || "name");
                    setPage(1);
                  }}
                >
                  <option value="name">Name</option>
                  <option value="companyName">Company</option>
                  <option value="location">Location</option>
                </select>
                <button
                  onClick={() => {
                    setSortDir(d => (d === "asc" ? "desc" : "asc"));
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  {sortDir === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            {/* Cards (paginated) */}
            <ul className="space-y-4">
              {paged.map((c) => {
                const displayName = c.name || c.companyName || "Unknown";
                return (
                  <li key={c.id} className="border rounded-lg p-4 shadow bg-white">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h2 className="font-semibold text-lg break-words">{displayName}</h2>
                        <p className="text-gray-600">{(c.companyName || "-") + " — " + (c.location || "-")}</p>
                      </div>
                      <button
                        onClick={() => setExpandedId(id => (id === c.id ? null : c.id))}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {expandedId === c.id ? "Hide Details" : "View Details"}
                      </button>
                    </div>

                    {expandedId === c.id && (
                      <div className="mt-3 text-gray-700 space-y-1">
                        <p><strong>Location:</strong> {c.location || "—"}</p>
                        <p><strong>Phone:</strong> {c.phone || "—"}</p>
                        <p className="break-words"><strong>Address:</strong> {c.address || "—"}</p>
                        <p className="break-words"><strong>Email:</strong> {c.email || "—"}</p>
                      </div>
                    )}
                  </li>
                );
              })}

              {paged.length === 0 && (
                <li className="text-center text-gray-500 py-8">No contractors found.</li>
              )}
            </ul>

            {/* Pagination controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="text-sm text-gray-600">
                Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={`px-3 py-1 rounded border ${page <= 1 ? "text-gray-400 border-gray-200" : "hover:bg-gray-100"}`}
                >
                  Prev
                </button>
                <span className="text-sm">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={`px-3 py-1 rounded border ${page >= totalPages ? "text-gray-400 border-gray-200" : "hover:bg-gray-100"}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

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
