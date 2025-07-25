// src/features/activities/components/AddActivityForm.tsx
"use client";

import React, { useState } from "react";
import { useCreateActivity } from "../hooks/useCreateActivity";

export default function AddActivityForm({ onSuccess }: { onSuccess?: () => void }) {
  const create = useCreateActivity();
  const [form, setForm] = useState<Partial<Activity>>({
    title: "",
    date: "",
    description: "",
    imageUrl: "",
    registerUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        space-y-4
        bg-[#003554]      /* <-- your new background color */
        text-white        /* make sure text is readable */
        p-6               /* padding */
        rounded-xl        /* rounded corners */
      "
    >
      <div>
        <label className="block font-medium mb-1">Title</label>
        <input
          name="title"
          value={form.title || ""}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1 text-black"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Date</label>
        <input
          name="date"
          type="date"
          value={form.date || ""}
          onChange={handleChange}
          required
          className="w-full border rounded px-2 py-1 text-black"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          required
          rows={3}
          className="w-full border rounded px-2 py-1 text-black"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Image URL</label>
        <input
          name="imageUrl"
          value={form.imageUrl || ""}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1 text-black"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Registration Link</label>
        <input
          name="registerUrl"
          value={form.registerUrl || ""}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1 text-black"
        />
      </div>

      <button
        type="submit"
        disabled={create.isLoading}
        className="
          w-full
          px-4 py-2
          bg-blue-600 text-white
          rounded hover:bg-blue-700
          transition
        "
      >
        {create.isLoading ? "Saving…" : "Save Activity"}
      </button>
    </form>
  );
}
