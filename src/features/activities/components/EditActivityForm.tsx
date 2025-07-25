// src/features/activities/components/EditActivityForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useActivities } from "../hooks/useActivities";
import { useUpdateActivity } from "../hooks/useUpdateActivity";

interface Props {
  activity: Activity;
  onSuccess?: () => void;
}

export default function EditActivityForm({ activity, onSuccess }: Props) {
  const update = useUpdateActivity();
  const [form, setForm] = useState<Activity>(activity);

  useEffect(() => {
    setForm(activity);
  }, [activity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(form, {
      onSuccess: () => onSuccess?.(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/** identical fields to AddActivityForm **/}
      <div>
        <label className="block font-medium">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      {/* …repeat Date, Description, Image URL, Register URL… */}
      <button
        type="submit"
        disabled={update.isLoading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {update.isLoading ? "Updating…" : "Update Activity"}
      </button>
    </form>
  );
}
