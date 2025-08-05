"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ActivityCreateInput } from "../types";
import { useCreateActivity } from "../hooks/useCreateActivity";

type FbPost = {
  id: string;
  message?: string;
  name?: string;
  created_time: string;
  start_time?: string;
  full_picture?: string;
  permalink_url: string;
};

type Props = { onClose: () => void };

const CATEGORIES = [
  { value: "CAPACITY_BUILDING", label: "Capacity Building Programs" },
  { value: "BUSINESS_TALK",     label: "Business Talk Series"       },
];

export default function FbImportModal({ onClose }: Props) {
  const qc     = useQueryClient();
  const create = useCreateActivity();

  const { data: posts = [], isLoading, error } = useQuery<FbPost[]>({
    queryKey: ["fbPosts"],
    queryFn: async () => {
      const res = await fetch("/api/facebook/posts");
      if (!res.ok) throw new Error("Failed to fetch Facebook posts");
      const json = await res.json();
      return Array.isArray(json) ? json : json.data;
    },
  });

  const [selected, setSelected] = useState<
    Record<string, { checked: boolean; category: string }>
  >({});

  const toggle = (id: string) =>
    setSelected((s) => ({
      ...s,
      [id]: { checked: !(s[id]?.checked), category: s[id]?.category || "" },
    }));

  const setCat = (id: string, category: string) =>
    setSelected((s) => ({
      ...s,
      [id]: { checked: true, category },
    }));

  const importSelected = () => {
    const toImport = posts.filter((p) => selected[p.id]?.checked);

    if (toImport.length === 0) {
      onClose();
      return;
    }

    toImport.forEach((p, idx) => {
      const title       = (p.name || p.message?.split("\n")[0] || "Facebook Post").slice(0, 100);
      const description = p.message || "";
      const dateStr     = p.start_time || p.created_time;
      const dateIso     = new Date(dateStr).toISOString();
      const category    = selected[p.id]?.category;

      const payload: ActivityCreateInput = {
        title,
        description,
        date: dateIso,
        source: "FACEBOOK",
        fbPostId: p.id,
        imageUrl: p.full_picture || undefined,
        registerUrl: p.permalink_url || undefined,
        category: category || undefined,
        // published left undefined to use Prisma default = true
      };

      create.mutate(payload, {
        onSuccess: () => {
          if (idx === toImport.length - 1) {
            qc.invalidateQueries({ queryKey: ["activities"] });
            onClose();
          }
        },
        onError: () => {
          if (idx === toImport.length - 1) {
            qc.invalidateQueries({ queryKey: ["activities"] });
            onClose();
          }
        },
      });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-[#003554] text-white p-6 rounded-2xl w-11/12 max-w-3xl max-h-[90vh] overflow-auto">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-300 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Import from Facebook</h2>

        {isLoading && <p>Loading posts…</p>}
        {error     && <p className="text-red-400">Unable to load posts.</p>}

        {!isLoading && !error && (
          <ul className="space-y-4">
            {posts.map((p) => {
              const sel   = selected[p.id] || { checked: false, category: "" };
              const short = p.message?.slice(0, 160) ?? "(no message)";

              return (
                <li
                  key={p.id}
                  className="bg-[#004d66] rounded p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={sel.checked}
                      onChange={() => toggle(p.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">
                        {(p.name || p.message?.split("\n")[0] || "Facebook Post").slice(0, 100)}
                      </p>
                      <p className="text-sm text-gray-200">
                        {new Date(dateStr).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-300 mt-2">{short}</p>
                      {p.full_picture && (
                        <Image
                          src={p.full_picture}
                          alt={p.name || "Facebook image"}
                          width={640}
                          height={360}
                          className="mt-2 object-cover rounded max-h-40"
                          unoptimized
                        />
                      )}
                      <a
                        href={p.permalink_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 text-xs underline mt-1 inline-block"
                      >
                        View on Facebook
                      </a>
                    </div>
                  </div>

                  <div className="ml-7">
                    <label className="text-xs uppercase tracking-wide block mb-1">
                      Category
                    </label>
                    <select
                      value={sel.category}
                      onChange={(e) => setCat(p.id, e.target.value)}
                      className="w-full bg-[#003554] border border-white/20 rounded px-2 py-1 text-sm"
                    >
                      <option value="">-- none --</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={importSelected}
            disabled={create.isLoading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isLoading ? "Importing…" : "Import Selected"}
          </button>
        </div>
      </div>
    </div>
  );
}
