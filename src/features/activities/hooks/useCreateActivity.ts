// src/features/activities/hooks/useCreateActivity.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, ActivityCreateInput } from "../types";

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ActivityCreateInput) =>
      fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create activity");
        return res.json() as Promise<Activity>;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
