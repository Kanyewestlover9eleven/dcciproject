export const runtime = "nodejs";
export async function GET() {
  return Response.json({
    STRAPI_URL: process.env.STRAPI_URL ?? null,
    HAS_TOKEN: Boolean(process.env.STRAPI_API_TOKEN),
  });
}
