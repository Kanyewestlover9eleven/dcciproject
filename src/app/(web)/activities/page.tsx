// src/app/activities/page.tsx
"use client";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

type Activity = {
  id: number;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  registerUrl?: string;
  category: "CAPACITY_BUILDING"|"BUSINESS_TALK"|"OTHER";
  published: boolean;
};

const qc = new QueryClient();

function Section({ title, items }: { title: string; items: Activity[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((act) => (
          <div
            key={act.id}
            className="flex flex-col border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
          >
            {act.imageUrl && (
              <div className="w-full h-48 overflow-hidden">
                <img src={act.imageUrl} alt={act.title} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-1">{act.title}</h3>
              <p className="text-sm text-gray-400 mb-2">
                {new Date(act.date).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mb-4 flex-1">{act.description}</p>
              {act.registerUrl && (
                <a
                  href={act.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  More Info
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitiesList() {
  const { data = [], isLoading, error } = useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: () => fetch("/api/activities?published=true").then(r => r.json()),
  });

  if (isLoading) return <p className="p-6">Loading activities…</p>;
  if (error) return <p className="p-6 text-red-500">Error loading activities.</p>;

  const capacity = data.filter(a => a.category === "CAPACITY_BUILDING");
  const talks    = data.filter(a => a.category === "BUSINESS_TALK");
  const other    = data.filter(a => a.category === "OTHER");

  return (
    <section className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Upcoming Activities</h1>
      <Section title="Capacity Building Programs" items={capacity} />
      <Section title="Business Talk Series" items={talks} />
      <Section title="Other Activities" items={other} />
    </section>
  );
}

export default function ActivitiesPage() {
  return (
    <QueryClientProvider client={qc}>
      <ActivitiesList />
    </QueryClientProvider>
  );
}
