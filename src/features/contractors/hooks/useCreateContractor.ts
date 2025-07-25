// src/features/contractors/hooks/useCreateContractor.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Contractor } from "../types";

export function useCreateContractor() {
  const qc = useQueryClient();
  return useMutation<Contractor, Error, Partial<Contractor>>(
    (newC) =>
      fetch("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newC),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create contractor");
        return res.json();
      }),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["contractors"] });
      },
    }
  );
}
