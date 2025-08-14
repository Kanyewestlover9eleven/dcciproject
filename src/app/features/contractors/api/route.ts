import { NextResponse } from "next/server";
import { PrismaClient, MemberStatus } from "@prisma/client";

export const runtime = "nodejs";
const prisma = new PrismaClient();

const toInt = (v: any): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? undefined : n;
};
const parseMaybeDate = (v: any): Date | undefined => {
  if (!v) return undefined;
  if (typeof v === "number") {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(epoch.getTime() + v * 86400000);
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { nationalId: { contains: q, mode: "insensitive" } },
          { addressEmail: { contains: q, mode: "insensitive" } },
          { contactFax: { contains: q, mode: "insensitive" } },
          { region: { contains: q, mode: "insensitive" } },
          { coreBusiness: { contains: q, mode: "insensitive" } },
          { industryType: { contains: q, mode: "insensitive" } },
        ],
      }
    : undefined;

  const rows = await prisma.contractor.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const b = await req.json();

  const created = await prisma.contractor.create({
    data: {
      name:           b.name ?? null,
      gender:         b.gender ?? null,                    // "M" | "F" | free text
      age:            toInt(b.age) ?? null,
      nationalId:     b.nationalId ?? null,
      membershipDate: parseMaybeDate(b.membershipDate),
      companyLicense: b.companyLicense ?? null,
      addressEmail:   b.addressEmail ?? null,              // raw combined address/email if you want
      contactFax:     b.contactFax ?? null,                // raw combined phone/fax if you want
      region:         b.region ?? null,
      coreBusiness:   b.coreBusiness ?? null,
      industryType:   b.industryType ?? null,
      status:         (b.status as MemberStatus) ?? MemberStatus.ACTIVE,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
