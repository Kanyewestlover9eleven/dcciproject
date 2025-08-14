"use client";
import { useState } from "react";
import { Chip, TextField } from "@mui/material";

export default function TagInput({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(value.join(", "));
  return (
    <div>
      <TextField
        label={label}
        value={raw}
        onChange={(e) => {
          const v = e.target.value;
          setRaw(v);
          const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
          onChange(parts);
        }}
        placeholder={placeholder}
        fullWidth
      />
      {value.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {value.map((v) => <Chip key={v} label={v} size="small" />)}
        </div>
      )}
    </div>
  );
}
