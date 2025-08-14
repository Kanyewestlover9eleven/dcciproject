import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.template.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const row = await prisma.template.create({
    data: {
      name: body.name,
      subject: body.subject ?? "",
      emailBody: body.emailBody ?? "",
      waBody: body.waBody ?? "",
    },
  });
  return NextResponse.json({ data: row }, { status: 201 });
}
