import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const row = await prisma.template.update({
    where: { id },
    data: {
      name: body.name,
      subject: body.subject,
      emailBody: body.emailBody,
      waBody: body.waBody,
    },
  });
  return NextResponse.json({ data: row });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.template.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
