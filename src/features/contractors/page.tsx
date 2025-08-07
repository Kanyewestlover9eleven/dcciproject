"use client";

import React, { useState } from "react";
import { DataGrid, GridRenderCellParams, GridColDef } from "@mui/x-data-grid";
import { Paper, Typography, Button } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import AddContractorForm from "./components/AddContractorForm";
import EditContractorForm from "./components/EditContractorForm";
import ImportExcel from "./components/ImportExcel";

import { Contractor } from "./types";
import { useContractors } from "./hooks/useContractors";

export default function ContractorsPage() {
  const qc = useQueryClient();
  

  // 1) fetch
  const { data: contractors, isLoading, error } = useContractors();

  // 2) local UI state
  const [isAddOpen, setAddOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Contractor | null>(null);

  // 3) columns
  const columns: GridColDef<Contractor>[] = [
    { field: "companyName", headerName: "Company", flex: 2, minWidth: 180 },
    { field: "companyNumber", headerName: "Reg. No.", width: 120 },
    {
      field: "registrationDate",
      headerName: "Reg. Date",
      width: 120,
      renderCell: (p: GridRenderCellParams<Contractor>) =>
        p.row.registrationDate
          ? new Date(p.row.registrationDate).toLocaleDateString()
          : "",
    },
    { field: "email", headerName: "Email", flex: 2, minWidth: 200 },
    { field: "website", headerName: "Website", flex: 1, minWidth: 150 },
    { field: "phone", headerName: "Phone", width: 120 },
    { field: "fax", headerName: "Fax", width: 120 },
    {
      field: "registeredAddress",
      headerName: "Reg. Addr",
      flex: 2,
      minWidth: 200,
      renderCell: (p) => p.row.registeredAddress ?? "",
    },
    {
      field: "correspondenceAddress",
      headerName: "Corr. Addr",
      flex: 2,
      minWidth: 200,
      renderCell: (p) => p.row.correspondenceAddress ?? "",
    },
    {
      field: "authorisedCapital",
      headerName: "Auth. Cap.",
      width: 120,
      renderCell: (p) => p.row.authorisedCapital ?? "",
    },
    {
      field: "paidUpCapital",
      headerName: "Paid-Up Cap.",
      width: 120,
      renderCell: (p) => p.row.paidUpCapital ?? "",
    },
    {
      field: "dayakEquity",
      headerName: "Equity %",
      width: 100,
      renderCell: (p) =>
        p.row.dayakEquity != null ? `${p.row.dayakEquity}%` : "",
    },
    {
      field: "contactPersonName",
      headerName: "Contact",
      flex: 1,
      minWidth: 150,
      renderCell: (p) => p.row.contactPersonName ?? "",
    },
    {
      field: "contactPersonPhone",
      headerName: "Contact Phone",
      width: 140,
      renderCell: (p) => p.row.contactPersonPhone ?? "",
    },
    { field: "status", headerName: "Status", width: 110 },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      renderCell: (p) =>
        p.row.createdAt
          ? new Date(p.row.createdAt).toLocaleDateString()
          : "",
    },
    {
      field: "directors",
      headerName: "Directors",
      width: 100,
      renderCell: (p) => p.row.directors.length,
    },
    {
      field: "licenses",
      headerName: "Licenses",
      width: 100,
      renderCell: (p) => p.row.licenses.length,
    },
    {
      field: "otherRegs",
      headerName: "Other Regs",
      width: 100,
      renderCell: (p) => p.row.otherRegs.length,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      renderCell: (p: GridRenderCellParams<Contractor>) => (
        <Button size="small" onClick={() => setEditing(p.row)}>
          Edit
        </Button>
      ),
    },
  ];

  if (isLoading) return <Typography>Loading contractors…</Typography>;
  if (error) return <Typography color="error">Error loading contractors</Typography>;

  return (
    <section className="min-w-0 space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography variant="h4">Members</Typography>
        <div className="flex flex-wrap gap-3">
          <Button variant="contained" color="success" onClick={() => setImportOpen(true)}>
            + Import Excel
          </Button>
          <Button variant="contained" color="primary" onClick={() => setAddOpen(true)}>
            + Add Contractor
          </Button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="overflow-x-auto min-w-0">
        <Paper className="min-w-full" elevation={2} sx={{ height: 650, width: "100%", p: 2, borderRadius: 2 }}>
          <DataGrid<Contractor>
            rows={contractors || []}
            columns={columns}
            getRowId={(r) => r.id}
            pagination
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 25 } } }}
            disableRowSelectionOnClick
          />
        </Paper>
      </div>

      {/* ─── Add Modal ─── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="relative bg-[#003554] p-8 rounded-2xl shadow-lg w-11/12 max-w-md max-h-[80vh] overflow-auto">
            <button onClick={() => setAddOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              ✕
            </button>
            <AddContractorForm onSuccess={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ["contractors"] }); }} />
          </div>
        </div>
      )}

      {/* ─── Import Modal ─── */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="relative bg-[#003554] p-8 rounded-2xl shadow-lg w-11/12 max-w-md max-h-[80vh] overflow-auto">
            <button onClick={() => setImportOpen(false)} className="absolute top-3 right-3 text-white hover:text-gray-700">
              ✕
            </button>
            <ImportExcel onSuccess={() => { 
              setImportOpen(false); 
              qc.invalidateQueries({ queryKey: ["contractors"] }); 
            }} />
          </div>
        </div>
      )}


      {/* ─── Edit Modal ─── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="relative bg-[#003554] p-8 rounded-2xl shadow-lg w-11/12 max-w-md max-h-[80vh] overflow-auto">
            <button onClick={() => setEditing(null)} className="absolute top-3 right-3 text-white-500 hover:text-gray-700">
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
