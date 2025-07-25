// src/features/activities/components/ActivitiesList.tsx
"use client";

import React from "react";
import { useActivities } from "../hooks/useActivities";
import { useUpdateActivity } from "../hooks/useUpdateActivity";

interface Props {
  onEdit: (a: Activity) => void;
}

export default function ActivitiesList({ onEdit }: Props) {
  const { data: activities = [], isLoading } = useActivities();
  const update = useUpdateActivity();

  if (isLoading) return <p>Loading activities…</p>;

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div
          key={act.id}
          className="p-4 border rounded-lg flex justify-between items-start"
        >
          <div>
            <h3 className="text-lg font-semibold">{act.title}</h3>
            <p className="text-sm text-gray-500">{act.date}</p>
            <p className="mt-1">{act.description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              className="px-3 py-1 bg-yellow-500 text-white rounded"
              onClick={() => onEdit(act)}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 bg-green-600 text-white rounded"
              onClick={() =>
                update.mutate({ ...act, title: act.title + " ✓" })
              }
            >
              Quick Mark
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
