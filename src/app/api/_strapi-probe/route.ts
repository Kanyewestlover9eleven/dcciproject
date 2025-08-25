export const runtime = "nodejs";
export async function GET() {
  const url = `${process.env.STRAPI_URL}/api/activities?populate=cover&sort=date:desc&pagination[pageSize]=1`;
  const r = await fetch(url, {
    headers: process.env.STRAPI_API_TOKEN
      ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }
      : {},
    cache: "no-store",
  });
  return new Response(await r.text(), {
    status: r.status,
    headers: { "content-type": r.headers.get("content-type") ?? "text/plain" },
  });
}
