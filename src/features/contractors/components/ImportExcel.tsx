// src/app/dashboard/contractors/ImportExcel.tsx
"use client";

import { useState } from "react";

export default function ImportExcel() {
  const [file, setFile] = useState<File|null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleImport = async () => {
    if (!file) return alert("Select a file first");
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // assumes header row matches your model keys:
    // name, email, phone, address, category, location, status (optional)
    const json = utils.sheet_to_json(sheet) as Record<string, 1>[];

    const res = await fetch("/api/contractors/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: json }),
    });
    if (res.ok) {
      alert("Imported successfully");
      setFile(null);
    } else {
      const err = await res.text();
      alert("Import failed: " + err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">Import from Excel</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
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
