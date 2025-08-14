import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";
const prisma = new PrismaClient();
const mKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to   = url.searchParams.get("to");
  const fromDate = from ? new Date(from) : new Date("2000-01-01");
  const toDate   = to   ? new Date(to)   : new Date();

  const rows = await prisma.contractor.findMany({
    where: { membershipDate: { gte: fromDate, lte: toDate } },
    select: { membershipDate: true },
  });

  const map = new Map<string, number>();
  for (const r of rows) {
    if (!r.membershipDate) continue;
    const k = mKey(new Date(r.membershipDate));
    map.set(k, (map.get(k) ?? 0) + 1);
  }

  const out: { date: string; count: number }[] = [];
  const cur = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), 1));
  const end = new Date(Date.UTC(toDate.getUTCFullYear(),   toDate.getUTCMonth(),   1));
  while (cur <= end) {
    const k = mKey(cur);
    out.push({ date: k, count: map.get(k) ?? 0 });
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return NextResponse.json(out);
}
