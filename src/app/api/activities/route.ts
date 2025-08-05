// src/app/api/activities/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Prisma, ActivityCategory } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");
  const categoryParam = searchParams.get("category");

  const where: Prisma.ActivityWhereInput = {};
  if (published !== null) {
    where.published = published === "true";
  }
  if (
    categoryParam &&
    // only assign if it’s one of the enum values
    Object.values(ActivityCategory).includes(
      categoryParam as ActivityCategory
    )
  ) {
    where.category = categoryParam as ActivityCategory;
  }

  const data = await prisma.activity.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return NextResponse.json(data);
}
