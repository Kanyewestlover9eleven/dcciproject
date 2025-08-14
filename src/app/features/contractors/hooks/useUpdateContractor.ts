// src/features/contractors/hooks/useUpdateContractor.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Contractor } from "../types";

export function useUpdateContractor() {
  const qc = useQueryClient();
  return useMutation<Contractor, Error, { id: number; data: Partial<Contractor> }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/contractors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}
