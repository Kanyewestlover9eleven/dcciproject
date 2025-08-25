import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { buildWhereFromFilters, type FilterInput } from "@/lib/contractorFilters";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { filters = {}, take = 1000, skip = 0 } = await req.json() as {
    filters?: FilterInput;
    take?: number;
    skip?: number;
  };

  const where = buildWhereFromFilters(filters);
  const contractors = await prisma.contractor.findMany({ where, take, skip });
  const total = await prisma.contractor.count({ where });

  return NextResponse.json({
    data: contractors,
    total,
    take,
    skip,
  });
}
