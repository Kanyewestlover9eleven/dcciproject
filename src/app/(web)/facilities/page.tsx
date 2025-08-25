// src/app/(web)/facilities/page.tsx
export const runtime = "nodejs";

type Facility = {
  id: number | string;
  slug: string;
  name: string;
  description: string | null;
  photo: string;
  ctaLabel: string;
  ctaUrl: string;
};

async function fetchFacilities(): Promise<Facility[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/strapi/facilities`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function FacilitiesPage() {
  const items = await fetchFacilities();
  if (!items?.length) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Facilities</h1>
        <p className="text-gray-600">No facilities available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Facilities</h1>
      {/* 1 col on mobile, 2 on small screens, 3 on large */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <li
            key={f.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <img
              src={f.photo}
              alt={f.name}
              className="h-48 w-full object-cover"
            />
            <div className="p-5">
              <h2 className="text-lg font-semibold">{f.name}</h2>
              {f.description && (
                <p className="mt-2 text-sm text-gray-600">{f.description}</p>
              )}
              <a
                href={f.ctaUrl || "#"}
                className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {f.ctaLabel || "Book Now"}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
