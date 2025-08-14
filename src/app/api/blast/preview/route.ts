// src/app/api/blast/preview/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { buildWhereFromFilters } from "@/lib/contractorFilters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { filters } = await req.json().catch(() => ({ filters: {} }));
  const where = buildWhereFromFilters(filters || {});

  // total matched
  const total = await prisma.contractor.count({ where });

  // crude signals for email/phone using the existing text fields
  const withEmail = await prisma.contractor.count({
    where: {
      AND: [
        where,
        { addressEmail: { contains: "@", mode: "insensitive" } },
      ],
    } as any,
  });

  const withWhatsApp = await prisma.contractor.count({
    where: {
      AND: [
        where,
        {
          OR: [
            { contactFax: { contains: "+6" } },
            { contactFax: { contains: "01" } },
          ],
        },
      ],
    } as any,
  });

  // sample recipients
  const sampleRows = await prisma.contractor.findMany({
    where,
    take: 50,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, addressEmail: true, contactFax: true },
  });

  const sample = sampleRows.map(r => ({
    id: r.id,
    name: r.name ?? "",
    email: r.addressEmail ?? "",
    phone: r.contactFax ?? "",
  }));

  return NextResponse.json({
    data: { total, withEmail, withWhatsApp, sample },
  });
}
