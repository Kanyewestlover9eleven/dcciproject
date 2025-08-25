// src/app/features/registrations/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

type Registration = {
  id: number;
  companyName: string;
  email?: string | null;
  phone?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string | Date | null;
  directors?: any;
  licenses?: any;
  otherRegistrations?: any;
  [k: string]: any;
};

const safeStr = (v: unknown) => (v == null ? "" : String(v));
const fmtDateTime = (v: unknown) => {
  if (!v) return "";
  const d =
    v instanceof Date
      ? v
      : typeof v === "string"
      ? new Date(v)
      : typeof v === "number"
      ? new Date(v)
      : null;
  if (!d || Number.isNaN(+d)) return "";
  return d.toLocaleString();
};
const safeJson = (v: any) => {
  try {
    return JSON.stringify(v ?? null, null, 2);
  } catch {
    return '"<unserializable>"';
  }
};

const extractReceiptUrl = (row: Registration): string => {
  const arr = Array.isArray(row.otherRegistrations) ? row.otherRegistrations : [];
  for (const it of arr) {
    const s = typeof it === "string" ? it : "";
    if (s.startsWith("RECEIPT:")) return s.slice(8).trim();
    const m = s.match(/https?:\/\/\S+\.pdf\b|\/receipts\/[^\s)]+/i);
    if (m) return m[0];
  }
  return "";
};

const normalize = (r: any): Registration => ({
  ...r,
  email: typeof r?.email === "string" ? r.email : "",
  phone: typeof r?.phone === "string" ? r.phone : "",
  createdAt: r?.createdAt
    ? r.createdAt instanceof Date
      ? r.createdAt.toISOString()
      : typeof r.createdAt === "string"
      ? r.createdAt
      : new Date(r.createdAt).toISOString()
    : "",
});

export default function RegistrationsFeaturePage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [selected, setSelected] = useState<Registration | null>(null);

  const { data, isLoading } = useQuery<Registration[]>({
    queryKey: ["registrations", tab],
    queryFn: async () => {
      const r = await fetch(`/api/registrations?status=${tab}`);
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      const rows = Array.isArray(j?.data) ? j.data : [];
      return rows.map(normalize);
    },
  });

  const rows = data ?? [];

  const approve = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/registrations/${id}/approve`, { method: "POST" });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registrations"] }),
  });

  const reject = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registrations"] }),
  });

  const columns: GridColDef<Registration>[] = [
    { field: "companyName", headerName: "Company", flex: 2, minWidth: 200 },

    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 180,
      valueFormatter: ({ value }) => safeStr(value),
      renderCell: ({ value }) => <span>{safeStr(value) || "—"}</span>,
    },

    {
      field: "phone",
      headerName: "Phone",
      width: 140,
      valueFormatter: ({ value }) => safeStr(value),
      renderCell: ({ value }) => <span>{safeStr(value) || "—"}</span>,
    },

    {
      field: "receipt",
      headerName: "Receipt",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (p) => {
        const url = extractReceiptUrl(p.row);
        return url ? (
          <Button
            size="small"
            component="a"
            href={url}
            target="_blank"
            rel="noreferrer"
            sx={{ textTransform: "none" }}
          >
            View PDF
          </Button>
        ) : (
          <span>—</span>
        );
      },
    },

    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (p) => (
        <Chip
          label={p.row.status}
          color={
            p.row.status === "PENDING"
              ? "warning"
              : p.row.status === "APPROVED"
              ? "success"
              : "default"
          }
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      ),
    },

    {
      field: "createdAt",
      headerName: "Submitted",
      width: 180,
      valueFormatter: ({ value }) => fmtDateTime(value),
      renderCell: ({ value }) => <span>{fmtDateTime(value) || "—"}</span>,
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 260,
      renderCell: (p) => (
        <div className="flex gap-6">
          <Button
            size="small"
            component="a"
            href={`/api/registrations/${p.row.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            sx={{ textTransform: "none" }}
          >
            PDF
          </Button>
          {p.row.status === "PENDING" && (
            <>
              <Button
                size="small"
                color="success"
                onClick={() => approve.mutate(p.row.id)}
                disabled={approve.isPending}
                sx={{ textTransform: "none" }}
              >
                {approve.isPending ? "Approving…" : "Approve"}
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => reject.mutate(p.row.id)}
                disabled={reject.isPending}
                sx={{ textTransform: "none" }}
              >
                {reject.isPending ? "Rejecting…" : "Reject"}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Box className="space-y-6">
      {/* Page header */}
      <div>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          Registrations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Review incoming applications, export PDFs, and approve or reject.
        </Typography>
      </div>

      {/* Tabs + Grid */}
      <Paper
        elevation={2}
        sx={{
          p: 0,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(255,255,255,0.08)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            px: 1,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              minHeight: 44,
            },
          }}
        >
          <Tab label="Pending" value="PENDING" />
          <Tab label="Approved" value="APPROVED" />
          <Tab label="Rejected" value="REJECTED" />
        </Tabs>

        <div className="p-3" style={{ height: 580 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => r.id}
            loading={isLoading}
            pagination
            density="comfortable"
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 25 } },
            }}
            disableRowSelectionOnClick
            onRowDoubleClick={(p) => setSelected(p.row)}
            rowHeight={44}
            columnHeaderHeight={48}
            getRowClassName={(p) =>
              p.indexRelativeToCurrentPage % 2 === 0 ? "datagrid--even" : "datagrid--odd"
            }
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(4px)",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                ".MuiDataGrid-columnHeaderTitle": { fontWeight: 600, letterSpacing: 0.2 },
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              },
              "& .datagrid--even": { bgcolor: "rgba(255,255,255,0.02)" },
              "& .datagrid--odd": { bgcolor: "transparent" },
              "& .MuiDataGrid-row:hover": { bgcolor: "rgba(0,0,0,0.1)" },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid rgba(255,255,255,0.08)",
                bgcolor: "rgba(255,255,255,0.03)",
              },
              "& .MuiButton-text": { textTransform: "none" },
            }}
          />
        </div>
      </Paper>

      {/* Details modal */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Registration Details</DialogTitle>
        <DialogContent
          dividers
          sx={{
            "& pre": {
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 1,
              p: 1.5,
            },
          }}
        >
          {selected && (
            <div className="space-y-2 text-sm">
              <div>
                <b>Company:</b> {selected.companyName}
              </div>
              <div>
                <b>Email:</b> {safeStr(selected.email)}
              </div>
              <div>
                <b>Phone:</b> {safeStr(selected.phone)}
              </div>
              <div>
                <b>Website:</b> {safeStr(selected.website)}
              </div>
              <div>
                <b>Registered Address:</b> {safeStr(selected.registeredAddress)}
              </div>
              <div>
                <b>Correspondence Address:</b> {safeStr(selected.correspondenceAddress)}
              </div>
              <div>
                <b>Capital:</b> Auth {safeStr(selected.authorisedCapital)} • Paid{" "}
                {safeStr(selected.paidUpCapital)}
              </div>
              <div>
                <b>Contact Person:</b> {safeStr(selected.contactPersonName)} (
                {safeStr(selected.contactPersonDesignation)}) •{" "}
                {safeStr(selected.contactPersonPhone)}
              </div>

              <div className="mt-3">
                <b>Directors</b>
              </div>
              <pre className="overflow-auto">{safeJson(selected.directors)}</pre>

              <div className="mt-3">
                <b>Licenses</b>
              </div>
              <pre className="overflow-auto">{safeJson(selected.licenses)}</pre>

              <div className="mt-3">
                <b>Other Registrations</b>
              </div>
              <pre className="overflow-auto">{safeJson(selected.otherRegistrations)}</pre>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {selected?.status === "PENDING" && (
            <>
              <Button
                onClick={() => {
                  if (selected) {
                    reject.mutate(selected.id);
                    setSelected(null);
                  }
                }}
                color="error"
                sx={{ textTransform: "none" }}
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  if (selected) {
                    approve.mutate(selected.id);
                    setSelected(null);
                  }
                }}
                variant="contained"
                color="primary"
                sx={{ textTransform: "none" }}
              >
                Approve
              </Button>
            </>
          )}
          <Button onClick={() => setSelected(null)} sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
