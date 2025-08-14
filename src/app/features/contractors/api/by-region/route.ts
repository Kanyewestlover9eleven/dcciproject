import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";
const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.contractor.groupBy({
    by: ["region"] as const,      // hint TS
    _count: { _all: true },
  });

  const data = rows
    .map(r => ({
      location: r.region ?? "Unknown",
      count: r._count?._all ?? 0, // _count can be nullable in types
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(data);
}
