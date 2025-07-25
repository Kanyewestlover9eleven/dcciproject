"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity } from "@/features/activities/types";
import { useCreateActivity } from "@/features/activities/hooks/useCreateActivity";

type FbPost = {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
  name?: string;
  start_time?: string;
};

type Props = {
  onClose: () => void;
};

const CATEGORIES = [
  { value: "CAPACITY_BUILDING", label: "Capacity Building Programs" },
  { value: "BUSINESS_TALK", label: "Business Talk Series" },
];

export default function FbImportModal({ onClose }: Props) {
  // Adjust this if your API returns { data: [...] }
  const { data: posts = [], isLoading, error } = useQuery<FbPost[]>({
    queryKey: ["fbPosts"],
    queryFn: async () => {
      const r = await fetch("/api/facebook/posts");
      if (!r.ok) throw new Error("FB fetch failed");
      const j = await r.json();
      // if your route returns { data: [...] }
      return Array.isArray(j) ? j : j.data;
    },
  });

  const create = useCreateActivity();
  const qc = useQueryClient();

  const [selected, setSelected] = useState<
    Record<string, { checked: boolean; category: string }>
  >({});

  const toggle = (id: string) =>
    setSelected((s) => ({
      ...s,
      [id]: { checked: !(s[id]?.checked), category: s[id]?.category || "" },
    }));

  const setCat = (id: string, category: string) =>
    setSelected((s) => ({ ...s, [id]: { checked: true, category } }));

  const importSelected = () => {
    const toImport = posts.filter((p) => selected[p.id]?.checked);

    toImport.forEach((p, idx) => {
      create.mutate(
        {
          title:
            (p.name || p.message?.split("\n")[0] || "Facebook Post").slice(
              0,
              100
            ),
          description: p.message || "",
          date: p.start_time || p.created_time,
          imageUrl: p.full_picture,
          registerUrl: p.permalink_url,
          source: "FACEBOOK",
          fbPostId: p.id,
          fbPermalink: p.permalink_url,
          category: selected[p.id]?.category as Activity["category"],
        } as Partial<Activity>,
        {
          onSuccess: () => {
            // Last one -> close & refetch
            if (idx === toImport.length - 1) {
              qc.invalidateQueries({ queryKey: ["activities"] });
              onClose();
            }
          },
        }
      );
    });

    if (toImport.length === 0) onClose();
  };

  if (!posts && !isLoading && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-[#003554] text-white p-6 rounded-2xl w-11/12 max-w-3xl max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-200 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Import from Facebook</h2>

        {isLoading && <p>Loading posts…</p>}
        {error && <p className="text-red-400">Unable to load posts.</p>}

        {!isLoading && !error && (
          <ul className="space-y-4">
            {posts.map((p) => {
              const short = p.message?.slice(0, 160) || "(no message)";
              const sel = selected[p.id];
              return (
                <li
                  key={p.id}
                  className="bg-[#004d66] rounded p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!sel?.checked}
                      onChange={() => toggle(p.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">
                        {(p.name ||
                          p.message?.split("\n")[0] ||
                          "Facebook Post"
                        ).slice(0, 100)}
                      </p>
                      <p className="text-sm text-gray-200">
                        {new Date(
                          p.start_time || p.created_time
                        ).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-300 mt-2">{short}</p>
                      {p.full_picture && (
                        <img
                          src={p.full_picture}
                          alt=""
                          className="mt-2 max-h-40 object-cover rounded"
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

                  {/* Category select */}
                  <div className="ml-7">
                    <label className="text-xs uppercase tracking-wide block mb-1">
                      Category
                    </label>
                    <select
                      value={sel?.category || ""}
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
