// src/app/(web)/activities/page.tsx
export const runtime = "nodejs";
import Link from "next/link";
import { listActivities } from "@/lib/activities";

export default async function ActivitiesPage() {
  try {
    const items = await listActivities();

    if (!items.length) {
      return (
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="mt-4 text-gray-600">No activities available.</p>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold">Activities</h1>

        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((it) => (
            <li
              key={it.slug}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {it.coverUrl && (
                <div className="relative aspect-[4/3] w-full bg-gray-100">
                  <img
                    src={it.coverUrl}
                    alt={it.title || "Activity cover"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900">{it.title}</h2>
                {it.date && (
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(it.date).toLocaleDateString()}
                  </p>
                )}

                <Link
                  href={`/activities/${it.slug}`}
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Read more
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (e: any) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold">Activities</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Activities failed. {e?.message}
        </pre>
      </div>
    );
  }
}
