import { useQuery } from "@tanstack/react-query";
import { Contractor } from "../types";

export function useContractors(q?: string) {
  return useQuery<Contractor[]>({
    queryKey: ["contractors", { q: q ?? "" }],
    queryFn: async () => {
      const url = q ? `/api/contractors?q=${encodeURIComponent(q)}` : "/api/contractors";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch contractors");
      return res.json();
    },
  });
}
