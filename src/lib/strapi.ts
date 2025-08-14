// lib/strapi.ts
const BASE = process.env.NEXT_PUBLIC_STRAPI_URL!;
if (!BASE) throw new Error("Missing NEXT_PUBLIC_STRAPI_URL");

export type RawMediaEntry = {
  id: number;
  Title: string;
  Description: string;
  Image: Array<{
    url: string;               // Strapi gives these relative URLs
    alternativeText: string | null;
    formats: {
      // you can pick any size you like; we’ll default to the original `url`
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  }>;
};

export type MediaItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  altText?: string | null;
};

export async function fetchMediaItems(): Promise<MediaItem[]> {
  const url = `${BASE}/api/medias?sort=createdAt:desc&populate=*`;
  console.log("⛓️ Fetching media:", url);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    console.error("⛓️ Strapi media error:", res.status, body);
    throw new Error(`Strapi media fetch failed (${res.status})`);
  }
  const json = (await res.json()) as { data: RawMediaEntry[] };

  return json.data.map((entry) => {
    // grab the first image in the array (or fallback)
    const img = entry.Image[0];
    // choose a format if you like: img.formats.small.url, etc.
    const imageUrl = img ? `${BASE}${img.url}` : "/placeholder.png";
    return {
      id: entry.id,
      title: entry.Title,
      description: entry.Description,
      imageUrl,
      altText: img?.alternativeText ?? undefined,
    };
  });
}
