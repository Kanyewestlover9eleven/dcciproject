// src/lib/activities.ts
import { strapiGet, strapiImg } from "./strapi";

type ActivityAPI = {
  id: number;
  Title?: string;
  Slug?: string;
  Date?: string;
  updatedAt?: string;
  publishedAt?: string;
  // Strapi v5 media is flat; v4 is nested. Support both.
  Cover?:
    | { url?: string; name?: string }                                   // v5
    | { data?: { id: number; attributes?: { url?: string; name?: string } } }; // v4
  Body?: any;
};

const BASE = "/api/activities";

function coverUrlFrom(a: ActivityAPI) {
  // v5
  // @ts-ignore
  if (a.Cover && (a.Cover as any).url) return strapiImg((a.Cover as any).url);
  // v4
  // @ts-ignore
  const nested = a.Cover?.data?.attributes?.url;
  return nested ? strapiImg(nested) : null;
}

export async function listActivities() {
  const q = "?populate=Cover&sort=Date:desc";
  const res = await strapiGet<{ data: ActivityAPI[] }>(`${BASE}${q}`);
  return res.data.map((a) => ({
    id: a.id,
    title: a.Title ?? "Untitled",
    slug: a.Slug ?? String(a.id),
    date: a.Date ?? a.publishedAt ?? a.updatedAt ?? null,
    coverUrl: coverUrlFrom(a),
  }));
}

export async function getActivityBySlug(slug: string) {
  const q = `?filters[Slug][$eq]=${encodeURIComponent(slug)}&populate=Cover&pagination[pageSize]=1`;
  const res = await strapiGet<{ data: ActivityAPI[] }>(`${BASE}${q}`);
  const a = res.data[0];
  if (!a) return null;
  return {
    id: a.id,
    title: a.Title ?? "Untitled",
    slug: a.Slug ?? String(a.id),
    date: a.Date ?? a.publishedAt ?? a.updatedAt ?? null,
    body: a.Body ?? "",
    coverUrl: coverUrlFrom(a),
  };
}
