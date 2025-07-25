import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const updated = await prisma.activity.update({
    where: { id: Number(params.id) },
    data: {
      title: body.title,
      date: body.date ? new Date(body.date) : undefined,
      description: body.description,
      imageUrl: body.imageUrl,
      registerUrl: body.registerUrl,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.activity.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}
