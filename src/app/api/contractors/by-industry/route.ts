import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";
const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.contractor.groupBy({
    by: ["industryType"] as const,
    _count: { _all: true },
  });

  const data = rows
    .map(r => ({
      type: r.industryType ?? "Unknown",
      count: r._count?._all ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(data);
}
