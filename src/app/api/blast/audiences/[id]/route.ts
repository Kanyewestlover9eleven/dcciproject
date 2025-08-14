import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await _req.json();
  const row = await prisma.audience.update({
    where: { id },
    data: { name: body.name, filters: body.filters },
  });
  return NextResponse.json({ data: row });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.audience.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
