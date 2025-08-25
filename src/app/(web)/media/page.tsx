// src/app/(web)/media/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { MediaItem } from "@/lib/strapi";

export default function MediaPage() {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <MediaPageInner />
    </QueryClientProvider>
  );
}

function MediaPageInner() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["strapi-media-items"],
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("pagination[pageSize]", "100"); // load up to 100
      qs.set("sort", "updatedAt:desc");

      const res = await fetch(`/api/strapi/media-items?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as MediaItem[];
    },
  });

  if (isLoading) return <p className="px-6 py-10 text-sm text-gray-600">Loading…</p>;
  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {(error as Error)?.message || "Failed to load media."}
        </p>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <p className="mt-4 text-gray-600">No media found.</p>
      </div>
    );
  }

  const items = data.filter((f) => !!f.url);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold">Media Library</h1>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {items.map((file) => (
          <li
            key={file.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="h-48 w-full overflow-hidden bg-gray-100">
              <img
                src={file.url}
                alt={file.alternativeText || file.name}
                className="h-full w-full object-cover transition duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              {file.text && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">{file.text}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
