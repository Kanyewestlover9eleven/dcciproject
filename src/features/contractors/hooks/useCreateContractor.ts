// src/features/contractors/hooks/useCreateContractor.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Contractor } from "../types";

export function useCreateContractor() {
  const qc = useQueryClient();
  return useMutation<Contractor, Error, Partial<Contractor>>({
    mutationFn: async (newData) => {
      const res = await fetch("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error("Creation failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}
