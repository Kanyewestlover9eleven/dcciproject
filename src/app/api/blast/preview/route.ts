import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { buildWhereFromFilters } from "@/lib/contractorFilters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { filters } = await req.json().catch(() => ({ filters: {} }));
  const where = buildWhereFromFilters(filters || {});

  // totals
  const total = await prisma.contractor.count({ where });

  // email-ready: contractor.addressEmail OR any registration.email has "@"
  const withEmail = await prisma.contractor.count({
    where: {
      AND: [
        where,
        {
          OR: [
            { addressEmail: { contains: "@", mode: "insensitive" } },
            { registrations: { some: { email: { contains: "@", mode: "insensitive" } } } },
          ],
        },
      ],
    },
  });

  // whatsapp-ready: contractor.contactFax OR any registration.phone looks phone-ish
  const withWhatsApp = await prisma.contractor.count({
    where: {
      AND: [
        where,
        {
          OR: [
            { contactFax: { contains: "+6" } },
            { contactFax: { contains: "01" } },
            { registrations: { some: { phone: { contains: "+6" } } } },
            { registrations: { some: { phone: { contains: "01" } } } },
          ],
        },
      ],
    },
  });

  // sample rows with fallback to latest registration email/phone
  const sampleRows = await prisma.contractor.findMany({
    where,
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      addressEmail: true,
      contactFax: true,
      registrations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { email: true, phone: true },
      },
    },
  });

  const sample = sampleRows.map((r) => {
    const reg = r.registrations?.[0];
    return {
      id: r.id,
      name: r.name ?? "",
      email: (r.addressEmail || reg?.email || "") ?? "",
      phone: (r.contactFax || reg?.phone || "") ?? "",
    };
  });

  return NextResponse.json({
    data: { total, withEmail, withWhatsApp, sample },
  });
}
