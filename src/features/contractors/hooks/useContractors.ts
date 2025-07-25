// src/features/contractors/hooks/useContractors.ts
import { useQuery } from "@tanstack/react-query";
import { Contractor } from "../types";

export function useContractors() {
  return useQuery<Contractor[]>({
    queryKey: ["contractors"],
    queryFn: async () => {
      const res = await fetch("/api/contractors");
      if (!res.ok) throw new Error("Failed to fetch contractors");
      return res.json();
    },
  });
}
