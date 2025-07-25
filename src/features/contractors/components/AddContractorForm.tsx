// src/app/dashboard/contractors/AddContractorForm.tsx
"use client";

import { useState } from "react";

export default function AddContractorForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/contractors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert("Contractor added!");
      setForm({ name: "", email: "", phone: "", address: "", category: "", location: "" });
    } else {
      alert("Failed to add contractor");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#003554] p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold">Add Contractor</h2>
      {(["name","email","phone","address","category","location"] as const).map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium">{field.charAt(0).toUpperCase()+field.slice(1)}</label>
          <input
            name={field}
            value={form[field]}
            onChange={handleChange}
            required={field==="name"||field==="email"}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      ))}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Add
      </button>
    </form>
  );
}
