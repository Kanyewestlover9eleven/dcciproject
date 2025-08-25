// src/features/contractors/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { DataGrid, GridRenderCellParams, GridColDef } from "@mui/x-data-grid";
import {
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Search, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import AddContractorForm from "./components/AddContractorForm";
import EditContractorForm from "./components/EditContractorForm";
import ImportExcel from "./components/ImportExcel";

import { Contractor } from "./types";
import { useContractors } from "./hooks/useContractors";

export default function ContractorsPage() {
  const qc = useQueryClient();

  // ── Search (debounced) ──
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 500);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [debouncedQ]);

  // ── Data ──
  const { data: contractors, isLoading, error } = useContractors(debouncedQ);

  // ── UI state ──
  const [isAddOpen, setAddOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Contractor | null>(null);

  // ── Columns (unchanged logic) ──
  const columns: GridColDef<Contractor>[] = [
    { field: "name", headerName: "Name", flex: 2, minWidth: 180 },
    { field: "gender", headerName: "Gender", width: 100 },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      width: 90,
      renderCell: (p) => p.row.age ?? "",
    },
    { field: "nationalId", headerName: "ID", width: 160 },
    {
      field: "membershipDate",
      headerName: "Member Since",
      width: 140,
      renderCell: (p) =>
        p.row.membershipDate
          ? new Date(p.row.membershipDate).toLocaleDateString()
          : "",
    },
    { field: "companyLicense", headerName: "Company License", flex: 2, minWidth: 200 },
    { field: "addressEmail", headerName: "Address / Email", flex: 2, minWidth: 220 },
    { field: "contactFax", headerName: "Contact / Fax", flex: 1, minWidth: 160 },
    { field: "region", headerName: "Region", width: 120 },
    { field: "coreBusiness", headerName: "Core Business", flex: 1, minWidth: 200 },
    { field: "industryType", headerName: "Industry", flex: 1, minWidth: 160 },
    { field: "status", headerName: "Status", width: 130, renderCell: (p) => p.row.status ?? "ACTIVE" },
    {
      field: "createdAt",
      headerName: "Created",
      width: 130,
      renderCell: (p) =>
        p.row.createdAt ? new Date(p.row.createdAt).toLocaleDateString() : "",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      renderCell: (p: GridRenderCellParams<Contractor>) => (
        <Button color="inherit" size="small" onClick={() => setEditing(p.row)}>
          Edit
        </Button>
      ),
    },
  ];

  if (isLoading) return <Typography>Loading contractors…</Typography>;
  if (error) return <Typography color="error">Error loading contractors</Typography>;

  return (
    <section className="min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
            Members
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Manage member records, imports and edits.
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <TextField
            size="small"
            placeholder="Search name, NRIC, region, industry…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            inputRef={inputRef}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="w-4 h-4" />
                </InputAdornment>
              ),
              endAdornment: q ? (
                <InputAdornment position="end">
                  <IconButton aria-label="clear search" onClick={() => setQ("")} edge="end">
                    <X className="w-4 h-4" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              minWidth: 320,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.04)",
                "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.24)" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
          />

          <Button
            variant="contained"
            color="success"
            onClick={() => setImportOpen(true)}
            sx={{ borderRadius: 2, textTransform: "none", px: 2.5 }}
          >
            + Import Excel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setAddOpen(true)}
            sx={{ borderRadius: 2, textTransform: "none", px: 2.5 }}
          >
            + Add Member
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-w-0">
        <Paper
          className="min-w-full"
          elevation={2}
          sx={{
            height: 650,
            width: "100%",
            p: 1.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <DataGrid<Contractor>
            rows={contractors || []}
            columns={columns}
            getRowId={(r) => r.id}
            pagination
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
            disableRowSelectionOnClick
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
              "& .MuiDataGrid-row:hover": {
                bgcolor: "rgba(0,0,0,0.1)",
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid rgba(255,255,255,0.08)",
                bgcolor: "rgba(255,255,255,0.03)",
              },
              "& .MuiButton-text": { textTransform: "none" },
            }}
          />
        </Paper>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="relative bg-[#003554] p-8 rounded-2xl shadow-lg w-11/12 max-w-md max-h-[80vh] overflow-auto">
            <button onClick={() => setAddOpen(false)} className="absolute top-3 right-3 text-gray-200 hover:text-white">
              ✕
            </button>
            <AddContractorForm
              onSuccess={() => {
                setAddOpen(false);
                qc.invalidateQueries({ queryKey: ["contractors"] });
              }}
            />
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="relative bg-[#003554] p-8 rounded-2xl shadow-lg w-11/12 max-w-md max-h-[80vh] overflow-auto">
            <button onClick={() => setImportOpen(false)} className="absolute top-3 right-3 text-white hover:text-gray-300">
              ✕
            </button>
            <ImportExcel
              onSuccess={() => {
                setImportOpen(false);
                qc.invalidateQueries({ queryKey: ["contractors"] });
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="relative bg-[#003554] p-8 rounded-2xl shadow-lg w-11/12 max-w-md max-h-[80vh] overflow-auto">
            <button onClick={() => setEditing(null)} className="absolute top-3 right-3 text-white hover:text-gray-300">
              ✕
            </button>
            <EditContractorForm
              contractor={editing}
              onSuccess={() => {
                setEditing(null);
                qc.invalidateQueries({ queryKey: ["contractors"] });
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
