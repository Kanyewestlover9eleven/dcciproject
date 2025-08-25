// src/app/api/strapi/media-items/route.ts
export const runtime = "nodejs";

function abs(u?: string) {
  if (!u) return "";
  const base = (process.env.STRAPI_URL || "").replace(/\/+$/, "");
  try { return new URL(u, base).href; } catch { return u; }
}

function pickUrl(row: any): string {
  if (row?.Asset?.url) return row.Asset.url;
  if (Array.isArray(row?.Asset) && row.Asset[0]?.url) return row.Asset[0].url;
  if (row?.Asset?.data?.attributes?.url) return row.Asset.data.attributes.url;
  if (Array.isArray(row?.Asset?.data) && row.Asset.data[0]?.attributes?.url) return row.Asset.data[0].attributes.url;
  // try common alt keys
  for (const k of ["image","file","media","cover","Image","File","Media","Cover"]) {
    const v = row?.[k];
    if (v?.url) return v.url;
    if (Array.isArray(v) && v[0]?.url) return v[0].url;
    if (v?.data?.attributes?.url) return v.data.attributes.url;
    if (Array.isArray(v?.data) && v.data[0]?.attributes?.url) return v.data[0].attributes.url;
  }
  // deep scan fallback
  const stack = [row];
  while (stack.length) {
    const cur: any = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    if (typeof cur.url === "string" && cur.url.includes("/uploads/")) return cur.url;
    for (const v of Object.values(cur)) if (v && typeof v === "object") stack.push(v as any);
  }
  return "";
}

export async function GET(req: Request) {
  const base = (process.env.STRAPI_URL || "").replace(/\/+$/, "");
  if (!base) return new Response("STRAPI_URL missing", { status: 500 });

  const u = new URL(req.url);
  const sp = new URLSearchParams(u.search);
  sp.set("populate", "*");
  if (!sp.has("pagination[page]")) sp.set("pagination[page]", "1");
  if (!sp.has("pagination[pageSize]")) sp.set("pagination[pageSize]", "24");
  if (!sp.has("sort")) sp.set("sort", "updatedAt:desc");

  const r = await fetch(`${base}/api/media-items?${sp.toString()}`, {
    headers: process.env.STRAPI_API_TOKEN ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` } : {},
    cache: "no-store",
  });

  const txt = await r.text();
  if (!r.ok) return new Response(txt || `Upstream ${r.status}`, { status: r.status });

  let json: any = {};
  try { json = JSON.parse(txt); } catch {}
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];

  const out = rows.flatMap((row) => {
    const url = pickUrl(row);
    if (!url) return [];
    const name = row?.Name || row?.name || `media-${row?.id ?? "x"}`;
    const alt =
      row?.Asset?.alternativeText ??
      row?.asset?.alternativeText ??
      row?.Image?.alternativeText ??
      row?.image?.alternativeText ??
      name ?? null;
    const text =
      row?.text ?? row?.Text ?? null;

    return [{ id: row.id ?? Math.random(), name, url: abs(url), alternativeText: alt, text }];
  });

  return Response.json(out);
}
