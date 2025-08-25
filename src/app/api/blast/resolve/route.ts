// src/app/api/blast/resolve/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { buildWhereFromFilters } from "@/lib/contractorFilters";
export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { filters = {}, take = 1000, skip = 0 } = await req.json().catch(() => ({}));
  const where = buildWhereFromFilters(filters);

  const rows = await prisma.contractor.findMany({
    where,
    skip: Number(skip) || 0,
    take: Math.min(Number(take) || 1000, 5000),
    orderBy: { id: "asc" },
    select: { id: true, name: true, addressEmail: true, contactFax: true },
  });

  // normalize simple recipient shape
  const recipients = rows.map(r => ({
    id: r.id,
    name: r.name ?? "",
    email: r.addressEmail ?? "",
    phone: r.contactFax ?? "",
  }));

  return NextResponse.json({ data: recipients });
}
