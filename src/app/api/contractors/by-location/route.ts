// app/api/contractors/by-location/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const data = await prisma.contractor.groupBy({
    by: ["registeredAddress"],      // or “location” if that’s your column
    _count: { registeredAddress: true },
  });
  return NextResponse.json(
    data.map((d) => ({
      location: d.registeredAddress,
      count: d._count.registeredAddress,
    }))
  );
}
