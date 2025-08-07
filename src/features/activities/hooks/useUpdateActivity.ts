import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity } from "../types";

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation<Activity, Error, { id: number; data: Partial<Activity> }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
  });
}
