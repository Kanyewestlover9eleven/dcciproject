// app/api/analytics/licenses-by-type/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const data = await prisma.license.groupBy({
    by: ["type"],
    _count: { type: true },
  });
  return NextResponse.json(
    data.map((d) => ({ type: d.type, count: d._count.type }))
  );
}
