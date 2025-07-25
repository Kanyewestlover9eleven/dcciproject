// src/app/api/activities/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");
  const category  = searchParams.get("category");

  const where: any = {};
  if (published !== null) where.published = published === "true";
  if (category) where.category = category;

  const data = await prisma.activity.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return NextResponse.json(data);
}

// POST stays same but allow category/published if sent
