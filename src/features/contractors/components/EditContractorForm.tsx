// src/app/(dashboard)/dashboard/contractors/EditContractorForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  TextField,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

interface Contractor {
  id: number;
  companyName: string;
  companyNumber: string | null;
  registrationDate: string | null;
  registeredAddress: string | null;
  correspondenceAddress: string | null;
  website: string | null;
  email: string;
  phone: string | null;
  fax: string | null;
  authorisedCapital: string | null;
  paidUpCapital: string | null;
  dayakEquity: number | null;
  contactPersonName: string | null;
  contactPersonDesignation: string | null;
  contactPersonPhone: string | null;
  status: string;
  directors: { id: number; name: string }[];
  licenses: {
    id: number;
    type: string;
    gradeOrClass?: string;
    subHeads?: string;
  }[];
  otherRegs: { id: number; description: string }[];
}

const STATUS_OPTIONS = ["pending", "active"];

interface EditContractorFormProps {
  contractor: Contractor;
  onSuccess: () => void;
}

const EditContractorForm: React.FC<EditContractorFormProps> = ({
  contractor,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    companyName: "",
    companyNumber: "",
    registrationDate: "",
    registeredAddress: "",
    correspondenceAddress: "",
    website: "",
    email: "",
    phone: "",
    fax: "",
    authorisedCapital: "",
    paidUpCapital: "",
    dayakEquity: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonPhone: "",
    status: "",
    directorsCsv: "",
    otherRegsCsv: "",
  });

  useEffect(() => {
    setForm({
      companyName: contractor.companyName,
      companyNumber: contractor.companyNumber || "",
      registrationDate: contractor.registrationDate?.slice(0, 10) || "",
      registeredAddress: contractor.registeredAddress || "",
      correspondenceAddress: contractor.correspondenceAddress || "",
      website: contractor.website || "",
      email: contractor.email,
      phone: contractor.phone || "",
      fax: contractor.fax || "",
      authorisedCapital: contractor.authorisedCapital || "",
      paidUpCapital: contractor.paidUpCapital || "",
      dayakEquity: contractor.dayakEquity?.toString() || "",
      contactPersonName: contractor.contactPersonName || "",
      contactPersonDesignation:
        contractor.contactPersonDesignation || "",
      contactPersonPhone: contractor.contactPersonPhone || "",
      status: contractor.status,
      directorsCsv: contractor.directors.map((d) => d.name).join(", "),
      otherRegsCsv: contractor.otherRegs
        .map((o) => o.description)
        .join(", "),
    });
  }, [contractor]);

  const mutation = useMutation({
    mutationFn: async (data: typeof form & { id: number }) => {
      const payload: any = { ...data };
      if (data.directorsCsv) {
        payload.directors = data.directorsCsv
          .split(",")
          .map((s) => s.trim());
      }
      if (data.otherRegsCsv) {
        payload.otherRegistrations = data.otherRegsCsv
          .split(",")
          .map((s) => s.trim());
      }
      if (data.dayakEquity) {
        payload.dayakEquity = parseFloat(data.dayakEquity);
      }
      return fetch(`/api/contractors/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (!res.ok) throw new Error("Update failed");
        return res.json();
      });
    },
    onSuccess: () => onSuccess(),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({ ...form, id: contractor.id });
      }}
      className="space-y-4"
    >
      <Stack spacing={2}>
        <TextField
          label="Company Name"
          name="companyName"
          value={form.companyName}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Company Number"
          name="companyNumber"
          value={form.companyNumber}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Registration Date"
          name="registrationDate"
          type="date"
          value={form.registrationDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Registered Address"
          name="registeredAddress"
          value={form.registeredAddress}
          onChange={handleChange}
          fullWidth
          multiline
        />
        <TextField
          label="Correspondence Address"
          name="correspondenceAddress"
          value={form.correspondenceAddress}
          onChange={handleChange}
          fullWidth
          multiline
        />
        <TextField
          label="Website"
          name="website"
          value={form.website}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Fax"
          name="fax"
          value={form.fax}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Authorised Capital"
          name="authorisedCapital"
          value={form.authorisedCapital}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Paid-Up Capital"
          name="paidUpCapital"
          value={form.paidUpCapital}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Dayak Equity (%)"
          name="dayakEquity"
          value={form.dayakEquity}
          onChange={handleChange}
          type="number"
          fullWidth
        />
        <TextField
          label="Contact Person Name"
          name="contactPersonName"
          value={form.contactPersonName}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Contact Person Designation"
          name="contactPersonDesignation"
          value={form.contactPersonDesignation}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Contact Person Phone"
          name="contactPersonPhone"
          value={form.contactPersonPhone}
          onChange={handleChange}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value }))
            }
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Directors (comma-separated)"
          name="directorsCsv"
          value={form.directorsCsv}
          onChange={handleChange}
          fullWidth
          multiline
        />
        <TextField
          label="Other Registrations (comma-separated)"
          name="otherRegsCsv"
          value={form.otherRegsCsv}
          onChange={handleChange}
          fullWidth
          multiline
        />
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isLoading}
        >
          Save Changes
        </Button>
      </Stack>
    </form>
  );
};

export default EditContractorForm;
