export const runtime = "nodejs";

// change these if you named fields differently
const KEY_PHOTO = ["Photo","photo","Image","image","Cover","cover","Asset","asset"];
const KEY_NAME  = ["Name","name","Title","title"];
const KEY_DESC  = ["Description","description","Text","text"];
const KEY_CTA_L = ["CtaLabel","ctalabel","ctaLabel","label","Label"];
const KEY_CTA_U = ["CtaUrl","ctaurl","ctaUrl","url","Url"];

function abs(u?: string) {
  if (!u) return "";
  const base = (process.env.STRAPI_URL || "").replace(/\/+$/, "");
  try { return new URL(u, base).href; } catch { return u; }
}

function pick(obj: any, keys: string[]) {
  for (const k of keys) if (obj?.[k] != null) return obj[k];
  return null;
}

function pickMediaUrl(row: any): string {
  for (const k of KEY_PHOTO) {
    const v = row?.[k];
    if (!v) continue;
    if (v?.url) return v.url;                                                  // v5 single
    if (Array.isArray(v) && v[0]?.url) return v[0].url;                         // v5 multiple
    if (v?.data?.attributes?.url) return v.data.attributes.url;                 // v4 single
    if (Array.isArray(v?.data) && v.data[0]?.attributes?.url) return v.data[0].attributes.url; // v4 multi
  }
  // deep fallback
  const stack = [row];
  while (stack.length) {
    const cur: any = stack.pop();
    if (cur && typeof cur === "object") {
      if (typeof cur.url === "string" && cur.url.includes("/uploads/")) return cur.url;
      for (const v of Object.values(cur)) if (v && typeof v === "object") stack.push(v as any);
    }
  }
  return "";
}

export async function GET(req: Request) {
  const base = (process.env.STRAPI_URL || "").replace(/\/+$/, "");
  if (!base) return new Response("STRAPI_URL missing", { status: 500 });

  const u = new URL(req.url);
  const sp = new URLSearchParams(u.search);
  sp.set("populate", "*");                             // wildcard to avoid wrong keys
  if (!sp.has("pagination[page]")) sp.set("pagination[page]", "1");
  if (!sp.has("pagination[pageSize]")) sp.set("pagination[pageSize]", "24");
  if (!sp.has("sort")) sp.set("sort", "updatedAt:desc");

  const r = await fetch(`${base}/api/facilities?${sp.toString()}`, {
    headers: process.env.STRAPI_API_TOKEN ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` } : {},
    cache: "no-store",
  });

  const txt = await r.text();
  if (!r.ok) return new Response(txt || `Upstream ${r.status}`, { status: r.status });

  let json: any = {};
  try { json = JSON.parse(txt); } catch {}
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];

  const out = rows.flatMap((row) => {
    const url = pickMediaUrl(row);
    if (!url) return [];                                  // drop entries without photo
    const name = pick(row, KEY_NAME) || `facility-${row?.id ?? "x"}`;
    const desc = pick(row, KEY_DESC);
    const ctaL = pick(row, KEY_CTA_L) || "Book Now";
    const ctaU = pick(row, KEY_CTA_U) || "#";
    return [{
      id: row.id ?? Math.random(),
      slug: row.Slug ?? row.slug ?? String(row.id ?? ""),
      name,
      description: desc ?? null,
      photo: abs(url),
      ctaLabel: ctaL,
      ctaUrl: ctaU,
    }];
  });

  return Response.json(out);
}
