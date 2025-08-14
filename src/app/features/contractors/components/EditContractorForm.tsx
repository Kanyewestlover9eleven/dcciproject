"use client";

import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, TextField, Stack, MenuItem, Select, InputLabel, FormControl } from "@mui/material";

type MemberStatus = "ACTIVE" | "INACTIVE" | "DECEASED";

interface Contractor {
  id: number;
  name: string | null;
  gender: string | null;
  age: number | null;
  nationalId: string | null;
  membershipDate: string | null;
  companyLicense: string | null;
  addressEmail: string | null;
  contactFax: string | null;
  region: string | null;
  coreBusiness: string | null;
  industryType: string | null;
  status?: MemberStatus | null;
}

const STATUS_OPTIONS: MemberStatus[] = ["ACTIVE", "INACTIVE", "DECEASED"];

export default function EditContractorForm({
  contractor,
  onSuccess,
}: {
  contractor: Contractor;
  onSuccess: () => void;
}) {
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

  useEffect(() => {
    setForm({
      name: contractor.name ?? "",
      gender: contractor.gender ?? "",
      age: contractor.age != null ? String(contractor.age) : "",
      nationalId: contractor.nationalId ?? "",
      membershipDate: contractor.membershipDate?.slice(0, 10) ?? "",
      companyLicense: contractor.companyLicense ?? "",
      addressEmail: contractor.addressEmail ?? "",
      contactFax: contractor.contactFax ?? "",
      region: contractor.region ?? "",
      coreBusiness: contractor.coreBusiness ?? "",
      industryType: contractor.industryType ?? "",
      status: (contractor.status ?? "ACTIVE") as MemberStatus,
    });
  }, [contractor]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        age: form.age === "" ? null : Number(form.age),
        membershipDate: form.membershipDate || null,
      };
      const res = await fetch(`/api/contractors/${contractor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-4"
    >
      <Stack spacing={2}>
        <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
        <TextField label="Gender" name="gender" value={form.gender} onChange={handleChange} fullWidth />
        <TextField label="Age" name="age" type="number" value={form.age} onChange={handleChange} fullWidth />
        <TextField label="National ID" name="nationalId" value={form.nationalId} onChange={handleChange} fullWidth />
        <TextField
          label="Date of Membership"
          name="membershipDate"
          type="date"
          value={form.membershipDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField label="Company License" name="companyLicense" value={form.companyLicense} onChange={handleChange} fullWidth />
        <TextField
          label="Address / Email (raw)"
          name="addressEmail"
          value={form.addressEmail}
          onChange={handleChange}
          fullWidth
          multiline
        />
        <TextField
          label="Contact / Fax (raw)"
          name="contactFax"
          value={form.contactFax}
          onChange={handleChange}
          fullWidth
          multiline
        />
        <TextField label="Region" name="region" value={form.region} onChange={handleChange} fullWidth />
        <TextField label="Core Business" name="coreBusiness" value={form.coreBusiness} onChange={handleChange} fullWidth />
        <TextField label="Industry Type" name="industryType" value={form.industryType} onChange={handleChange} fullWidth />

        <FormControl fullWidth>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            label="Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MemberStatus }))}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" disabled={mutation.status === "pending"}>
          Save Changes
        </Button>
      </Stack>
    </form>
  );
}
