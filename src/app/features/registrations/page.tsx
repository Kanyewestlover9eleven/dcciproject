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
            >
              {approve.isPending ? "Approving…" : "Approve"}
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => reject.mutate(p.row.id)}
              disabled={reject.isPending}
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
      <Typography variant="h4">Registrations</Typography>

      <Paper className="p-2">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary">
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
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
            disableRowSelectionOnClick
          />
        </div>
      </Paper>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>Registration Details</DialogTitle>
        <DialogContent dividers>
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
                <b>Capital:</b> Auth {safeStr(selected.authorisedCapital)} • Paid {safeStr(selected.paidUpCapital)}
              </div>
              <div>
                <b>Contact Person:</b> {safeStr(selected.contactPersonName)} ({safeStr(selected.contactPersonDesignation)}) •{" "}
                {safeStr(selected.contactPersonPhone)}
              </div>

              <div className="mt-3">
                <b>Directors</b>
              </div>
              <pre className="bg-gray-100 p-2 rounded overflow-auto">{safeJson(selected.directors)}</pre>

              <div className="mt-3">
                <b>Licenses</b>
              </div>
              <pre className="bg-gray-100 p-2 rounded overflow-auto">{safeJson(selected.licenses)}</pre>

              <div className="mt-3">
                <b>Other Registrations</b>
              </div>
              <pre className="bg-gray-100 p-2 rounded overflow-auto">{safeJson(selected.otherRegistrations)}</pre>
            </div>
          )}
        </DialogContent>
        <DialogActions>
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
              >
                Approve
              </Button>
            </>
          )}
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
