// src/features/contractors/components/ImportExcel.tsx
"use client";

import { useState } from "react";
import { read, utils } from "xlsx";

// Define the props type
interface ImportExcelProps {
  onSuccess?: () => void;
}

// Define the exact structure based on your Prisma schema and API route
interface ExcelContractorData {
  companyName: string;
  companyNumber?: string;
  registrationDate?: string;
  
  registeredAddress?: string;
  correspondenceAddress?: string;
  website?: string;
  email: string;
  phone?: string;
  fax?: string;
  
  authorisedCapital?: string;
  paidUpCapital?: string;
  dayakEquity?: string;
  
  contactPersonName?: string;
  contactPersonDesignation?: string;
  contactPersonPhone?: string;
  
  // For arrays, you might need to handle these specially in your import logic
  directors?: string; // Comma-separated names or JSON string
  licenses?: string;  // JSON string of licenses array
  otherRegistrations?: string; // Comma-separated or JSON string
  
  // Status will default to "pending" if not provided
  status?: string;
  
  // Allow additional fields that might be in Excel
  [key: string]: string | undefined;
}

export default function ImportExcel({ onSuccess }: ImportExcelProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleImport = async () => {
    if (!file) return alert("Select a file first");
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Use the specific type based on your schema
    const json = utils.sheet_to_json(sheet) as ExcelContractorData[];

    const res = await fetch("/api/contractors/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: json }),
    });
    if (res.ok) {
      alert("Imported successfully");
      setFile(null);
      
      // Call onSuccess if provided
      if (onSuccess) onSuccess();
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