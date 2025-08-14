import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

export const runtime = "nodejs";
const prisma = new PrismaClient();

// helpers
const toInt = (v: any) => (v === "" || v == null ? undefined : parseInt(String(v), 10));
const parseDate = (s?: string | null) => {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const groupBy = (searchParams.get("groupBy") || "region") as
    | "region" | "industryType" | "gender" | "status" | "ageBand";

  const from = parseDate(searchParams.get("from"));
  const to   = parseDate(searchParams.get("to"));

  // optional filters (comma-separated lists)
  const status = searchParams.get("status")?.split(",").filter(Boolean);
  const gender = searchParams.get("gender")?.split(",").filter(Boolean);
  const region = searchParams.get("region")?.split(",").filter(Boolean);
  const industryType = searchParams.get("industryType")?.split(",").filter(Boolean);

  const ageMin = toInt(searchParams.get("ageMin"));
  const ageMax = toInt(searchParams.get("ageMax"));

  const where: Prisma.ContractorWhereInput = {
    ...(from && to ? { membershipDate: { gte: from, lte: to } } : {}),
    ...(status?.length ? { status: { in: status as any } } : {}),
    ...(gender?.length ? { gender: { in: gender } } : {}),
    ...(region?.length ? { region: { in: region } } : {}),
    ...(industryType?.length ? { industryType: { in: industryType } } : {}),
    ...(ageMin != null || ageMax != null
      ? { age: { ...(ageMin != null ? { gte: ageMin } : {}), ...(ageMax != null ? { lte: ageMax } : {}) } }
      : {}),
  };

  // Age bands need manual bucketing
  if (groupBy === "ageBand") {
    const rows = await prisma.contractor.findMany({ where, select: { age: true } });
    const buckets: Record<string, number> = {
      "<20": 0, "20-29": 0, "30-39": 0, "40-49": 0, "50-59": 0, "60+": 0, "Unknown": 0,
    };
    for (const r of rows) {
      const a = r.age;
      if (a == null) buckets["Unknown"]++;
      else if (a < 20) buckets["<20"]++;
      else if (a < 30) buckets["20-29"]++;
      else if (a < 40) buckets["30-39"]++;
      else if (a < 50) buckets["40-49"]++;
      else if (a < 60) buckets["50-59"]++;
      else buckets["60+"]++;
    }
    const data = Object.entries(buckets).map(([label, count]) => ({ label, count }));
    return NextResponse.json({ data });
  }

  // Direct groupBy supported by Prisma
  const gb = await prisma.contractor.groupBy({
    by: [groupBy as any],
    where,
    _count: { _all: true },
  });

  // Normalize nulls & field names
  const data = gb.map((row) => ({
    label: (row as any)[groupBy] ?? "Unknown",
    count: (row as any)._count._all as number,
  }));

  return NextResponse.json({ data });
}
