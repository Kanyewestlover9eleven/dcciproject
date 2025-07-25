// app/api/analytics/registrations-over-time/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "2025-01-01";
  const to   = searchParams.get("to")   || new Date().toISOString().slice(0,10);

  const data = await prisma.contractor.groupBy({
    by: ["registrationDate"],
    _count: { registrationDate: true },
    where: {
      registrationDate: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
  });

  return NextResponse.json(
    data.map((d) => ({
      date: d.registrationDate!.toISOString().slice(0,10),
      count: d._count.registrationDate,
    }))
  );
}
