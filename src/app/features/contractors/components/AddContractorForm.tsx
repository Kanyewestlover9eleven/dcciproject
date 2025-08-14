"use client";

import { useState } from "react";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";

type MemberStatus = "ACTIVE" | "INACTIVE" | "DECEASED";

export default function AddContractorForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({
    name: "",
    gender: "",
    age: "",
    nationalId: "",
    membershipDate: "",
    companyLicense: "",
    addressEmail: "",
    contactFax: "",
    region: "",
    coreBusiness: "",
    industryType: "",
    status: "ACTIVE" as MemberStatus,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      age: form.age ? Number(form.age) : null,
      membershipDate: form.membershipDate || null,
    };
    const res = await fetch("/api/contractors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      alert("Member added!");
      setForm({
        name: "",
        gender: "",
        age: "",
        nationalId: "",
        membershipDate: "",
        companyLicense: "",
        addressEmail: "",
        contactFax: "",
        region: "",
        coreBusiness: "",
        industryType: "",
        status: "ACTIVE",
      });
      onSuccess?.();
    } else {
      alert("Failed to add member");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#003554] p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold">Add Member</h2>

      {["name", "gender", "age", "nationalId", "membershipDate", "companyLicense", "addressEmail", "contactFax", "region", "coreBusiness", "industryType"].map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium">
            {field === "membershipDate" ? "Date of Membership" : field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            name={field}
            type={field === "age" ? "number" : field === "membershipDate" ? "date" : "text"}
            value={(form as any)[field]}
            onChange={handleChange}
            required={field === "name"}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      ))}

      <FormControl fullWidth>
        <InputLabel id="status-label">Status</InputLabel>
        <Select
          labelId="status-label"
          label="Status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MemberStatus }))}
        >
          {(["ACTIVE", "INACTIVE", "DECEASED"] as MemberStatus[]).map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
    </form>
  );
}
