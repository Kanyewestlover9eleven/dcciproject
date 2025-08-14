//registrations/[id]/approve/route.ts

import { NextResponse } from "next/server";
import { PrismaClient, RegistrationStatus } from "@prisma/client";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const row = await prisma.registration.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const status = body?.status as RegistrationStatus | undefined;

  if (status && !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const row = await prisma.registration.update({
    where: { id },
    data: { status: status ?? undefined },
  });

  return NextResponse.json({ data: row });
}
