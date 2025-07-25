// src/app/dashboard/components/PendingList.tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Check } from "lucide-react";

export function PendingList({
  items,
}: {
  items: { id: number; name: string; email: string; submitted: string }[];
}) {
  const queryClient = useQueryClient();

  // v5 single-object signature
  const activateMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/contractors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      }).then((res) => {
        if (!res.ok) throw new Error("Activation failed");
        return res.json();
      }),
    onSuccess: () => {
      // refetch the pending and full contractor lists & counts
      queryClient.invalidateQueries({ queryKey: ["pending"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
      queryClient.invalidateQueries({ queryKey: ["total"] });
    },
  });

  return (
    <div className="bg-[#003554] rounded-2xl shadow-sm p-6 space-y-4">
      <ul className="divide-y divide-gray-200">
        {items.map((c) => (
          <li
            key={c.id}
            className="flex justify-between items-center py-3"
          >
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-gray-500">{c.email}</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => activateMutation.mutate(c.id)}
                disabled={activateMutation.isLoading}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Activate
              </button>

              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{c.submitted}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
