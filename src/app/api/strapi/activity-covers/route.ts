export const runtime = "nodejs";

function abs(url: string) {
  const base = (process.env.STRAPI_URL || "").replace(/\/+$/, "");
  return url?.startsWith("http") ? url : `${base}${url}`;
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const page = u.searchParams.get("page") || "1";
  const pageSize = u.searchParams.get("pageSize") || "24";
  const q = u.searchParams.get("q")?.trim();

  // Build Strapi query: Activities with populated Cover and optional Title filter
  const sp = new URLSearchParams();
  sp.set("populate", "Cover");
  sp.set("sort", "Date:desc");
  sp.set("pagination[page]", page);
  sp.set("pagination[pageSize]", pageSize);
  if (q) sp.set("filters[Title][$containsi]", q);

  const res = await fetch(
    `${process.env.STRAPI_URL}/api/activities?${sp.toString()}`,
    {
      headers: process.env.STRAPI_API_TOKEN
        ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }
        : {},
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    return new Response(txt, { status: res.status });
  }

  const json = await res.json();
  // Normalize to a flat media list from Cover
  const out = (json.data as any[]).flatMap((item) => {
    const a = item; // Strapi v5 returns fields top-level
    const cover = a?.Cover?.data;
    if (!cover) return [];
    const att = cover.attributes || {};
    return [{
      id: cover.id,
      name: att.name || a.Title || `activity-${item.id}`,
      url: abs(att.url),
      alternativeText: att.alternativeText || a.Title || null,
      activitySlug: a.Slug,
      activityTitle: a.Title,
      updatedAt: a.updatedAt,
    }];
  });

  return Response.json(out);
}
