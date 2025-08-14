// src/features/contractors/components/ImportExcel.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

interface ImportExcelProps { onSuccess?: () => void }

export default function ImportExcel({ onSuccess }: ImportExcelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setCount(null);
  };

  const handleImport = async () => {
    if (!file) return alert("Select a file first");

    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const preferred = ["MAIN LIST 2025", "MASTER LIST 2024"];
    const sheetName = preferred.find((n) => wb.SheetNames.includes(n)) ?? wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];

    // AoA: rows = [ ["DCCI MEMBERSHIP ...", "", ...], ["Name","Gender","ID",...], ["John", "M", "A123", ...], ... ]
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: true, defval: "" });

    setCount(rows.length);

    const res = await fetch("/api/contractors/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows), // send AoA directly
    });

    if (!res.ok) {
      const err = await res.text();
      alert("Import failed: " + err);
      return;
    }

    const json = await res.json();
    alert(`Imported ${json.imported} rows`);
    setFile(null);
    onSuccess?.();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">Import from Excel</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
      {count !== null && <p className="text-sm text-gray-600">Parsed rows: {count}</p>}
      <button
        onClick={handleImport}
        disabled={!file}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Import
      </button>
    </div>
  );
}
