import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
const prisma = new PrismaClient();

function parseDate(s?: string | null) {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = parseDate(searchParams.get("from"));
  const to   = parseDate(searchParams.get("to"));
  const gran = (searchParams.get("granularity") || "month") as "day" | "month" | "year";

  const where = from && to ? { membershipDate: { gte: from, lte: to } } : {};

  // Pull only needed fields and bucket in JS (simpler than raw SQL for portability)
  const rows = await prisma.contractor.findMany({
    where,
    select: { membershipDate: true },
  });

  const fmt = (d: Date) => {
    if (gran === "year")  return `${d.getUTCFullYear()}`;
    if (gran === "month") return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  };

  const map = new Map<string, number>();
  for (const r of rows) {
    const d = r.membershipDate;
    if (!d) continue;
    const key = fmt(new Date(d));
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  const data = Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, count]) => ({ date, count }));

  return NextResponse.json({ data });
}
