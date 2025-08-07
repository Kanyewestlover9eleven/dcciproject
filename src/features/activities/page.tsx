"use client";

import React, { useState } from "react";
import { Typography, Button, Paper } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useQueryClient } from "@tanstack/react-query";

import { useActivities } from "@/features/activities/hooks/useActivities";
import { useDeleteActivity } from "@/features/activities/hooks/useDeleteActivity";
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

  // only keep the import-from-FB state
  const [importOpen, setImportOpen] = useState(false);

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", flex: 2 },
    {
      field: "date",
      headerName: "Date",
      width: 130,
      renderCell: (p: GridRenderCellParams) =>
        p.row.date ? new Date(p.row.date).toLocaleDateString() : "-",
    },
    {
      field: "category",
      headerName: "Category",
      width: 190,
      renderCell: ({ row }) => categoryLabel(row.category),
    },
    {
      field: "source",
      headerName: "Src",
      width: 80,
      renderCell: ({ row }) => (row.source === "FACEBOOK" ? "FB" : "Manual"),
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
        <Button variant="contained" onClick={() => setImportOpen(true)}>
          Import from Facebook
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Paper sx={{ height: 600, width: "100%", p: 2 }}>
          <DataGrid
            rows={activities}
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

      {/* Facebook Import Modal */}
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
