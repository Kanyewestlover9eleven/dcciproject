import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.audience.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.filters) {
    return NextResponse.json({ error: "name and filters required" }, { status: 400 });
  }
  const row = await prisma.audience.create({ data: { name: body.name, filters: body.filters } });
  return NextResponse.json({ data: row }, { status: 201 });
}
