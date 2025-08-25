export const runtime = "nodejs";

function abs(url: string) {
  const base = (process.env.STRAPI_URL || "").replace(/\/+$/, "");
  try { return new URL(url, base).href; } catch { return url; }
}

export async function GET(req: Request) {
  const qs = new URL(req.url).search; // preserves pagination and filters[name][$containsi]
  const r = await fetch(`${process.env.STRAPI_URL}/api/upload/files${qs}`, {
    headers: process.env.STRAPI_API_TOKEN
      ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }
      : {},
    cache: "no-store",
  });

  if (!r.ok) return new Response(await r.text(), { status: r.status });

  // Strapi v5 returns an array of files
  const files = await r.json();
  const out = (files as any[]).map((f) => ({
    id: f.id,
    name: f.name,
    url: abs(f.url), // normalize relative -> absolute
    alternativeText: f.alternativeText ?? null,
  }));
  return Response.json(out);
}
