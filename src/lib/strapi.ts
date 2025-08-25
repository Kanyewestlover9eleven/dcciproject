const BASE = (process.env.STRAPI_URL || "").replace(/\/+$/, "");
const TOKEN = process.env.STRAPI_API_TOKEN;

type FetchInit = Omit<RequestInit, "headers"> & { headers?: Record<string,string> };

export async function strapiGet<T>(path: string, init?: FetchInit): Promise<T> {
  if (!BASE) throw new Error("STRAPI_URL missing");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}), ...(init?.headers||{}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Strapi ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export function strapiImg(u?: string) {
  if (!u) return null;
  try {
    const url = new URL(u, BASE);           // handles relative or absolute
    if (url.hostname === "0.0.0.0") url.hostname = "localhost";
    return url.href;
  } catch { return null; }
}
