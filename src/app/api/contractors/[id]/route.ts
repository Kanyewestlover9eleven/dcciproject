// app/api/contractors/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const body = await request.json();

  // only allow updating status for now
  if (!body.status) {
    return NextResponse.json(
      { error: "Missing `status` in request body" },
      { status: 400 }
    );
  }

  const updated = await prisma.contractor.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json(updated);
}

// (Optionally) allow fetching a single contractor
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const contractor = await prisma.contractor.findUnique({
    where: { id },
    include: { directors: true, licenses: true, otherRegs: true },
  });
  if (!contractor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(contractor);
}
