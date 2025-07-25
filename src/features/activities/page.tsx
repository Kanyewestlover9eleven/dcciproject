// src/app/dashboard/activities/page.tsx
"use client";

import React, { useState } from "react";
import { Typography, Button, Paper } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useQueryClient } from "@tanstack/react-query";

import { useActivities } from "@/features/activities/hooks/useActivities";
import { useDeleteActivity } from "@/features/activities/hooks/useDeleteActivity";
import AddActivityForm from "@/features/activities/components/AddActivityForm";
import EditActivityForm from "@/features/activities/components/EditActivityForm";
import FbImportModal from "@/features/activities/components/FbImportModal";

// helper to map enum -> label
const categoryLabel = (c?: string) => {
  switch (c) {
    case "CAPACITY_BUILDING":
      return "Capacity Building";
    case "BUSINESS_TALK":
      return "Business Talk";
    default:
      return "";
  }
};

export default function ActivitiesDashboard() {
  const qc = useQueryClient();
  const { data: activities = [], isLoading, error } = useActivities();
  const del = useDeleteActivity();

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", flex: 2 },
    {
      field: "date",
      headerName: "Date",
      width: 130,
      renderCell: (p: GridRenderCellParams) =>
        p.row?.date ? new Date(p.row.date).toLocaleDateString() : "-",
    },
    {
      field: "category",
      headerName: "Category",
      width: 190,
      renderCell: ({ row }) => categoryLabel(row?.category),
    },
    {
      field: "source",
      headerName: "Src",
      width: 80,
      renderCell: ({ row }) => (row?.source === "FACEBOOK" ? "FB" : "Manual"),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 3,
      minWidth: 200,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (p) => (
        <>
          <Button size="small" onClick={() => setEditingId(p.row.id)}>
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() =>
              del.mutate(p.row.id, {
                onSuccess: () =>
                  qc.invalidateQueries({ queryKey: ["activities"] }),
              })
            }
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  if (isLoading) return <Typography>Loading…</Typography>;
  if (error) return <Typography color="error">Error loading activities</Typography>;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Typography variant="h4">Manage Activities</Typography>
        <div className="flex gap-2">
          <Button variant="contained" onClick={() => setAdding(true)}>
            + New Activity
          </Button>
          <Button variant="contained" onClick={() => setImportOpen(true)}>
            Import from Facebook
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Paper sx={{ height: 600, width: "100%", p: 2 }}>
          <DataGrid
            rows={activities ?? []}
            columns={columns}
            getRowId={(r) => r.id}
            pagination
            pageSizeOptions={[10, 25]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
            }}
            disableRowSelectionOnClick
          />
        </Paper>
      </div>

      {/* Add Modal */}
      {adding && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-[#003554] p-6 rounded-lg max-w-md w-full relative">
            <button
              onClick={() => setAdding(false)}
              className="absolute top-2 right-2 text-white"
            >
              ✕
            </button>
            <AddActivityForm
              onSuccess={() => {
                setAdding(false);
                qc.invalidateQueries({ queryKey: ["activities"] });
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingId != null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-[#003554] p-6 rounded-lg max-w-md w-full relative">
            <button
              onClick={() => setEditingId(null)}
              className="absolute top-2 right-2 text-white"
            >
              ✕
            </button>
            <EditActivityForm
              activity={activities.find((a) => a.id === editingId)!}
              onSuccess={() => {
                setEditingId(null);
                qc.invalidateQueries({ queryKey: ["activities"] });
              }}
            />
          </div>
        </div>
      )}

      {/* FB Import Modal */}
      {importOpen && (
        <FbImportModal
          onClose={() => {
            setImportOpen(false);
            qc.invalidateQueries({ queryKey: ["activities"] });
          }}
        />
      )}
    </section>
  );
}
