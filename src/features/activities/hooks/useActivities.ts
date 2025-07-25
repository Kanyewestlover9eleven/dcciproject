import { useQuery } from "@tanstack/react-query";
import { Activity } from "../types";

export function useActivities() {
  return useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await fetch("/api/activities");
      if (!res.ok) throw new Error("Unable to load activities");
      return res.json();
    },
  });
}
