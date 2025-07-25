// app/api/contractors/pending/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const list = await prisma.contractor.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 10,
  });
  // include a submitted‐at label:
  const items = list.map((c) => ({
    id: c.id,
    name: c.companyName,
    email: c.email,
    submitted: c.createdAt.toLocaleDateString(),
  }));
  return NextResponse.json(items);
}
