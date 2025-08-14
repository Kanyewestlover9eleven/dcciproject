import { NextResponse } from "next/server";
import { PrismaClient, RegistrationStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as RegistrationStatus | null;
  const where = status ? { status } : {};
  const rows = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.companyName) {
    return NextResponse.json({ error: "companyName is required" }, { status: 400 });
  }

  // Accept the form as-is; coerce arrays
  const directors = Array.isArray(body.directors) ? body.directors : [];
  const otherRegs = Array.isArray(body.otherRegistrations) ? body.otherRegistrations : [];
  const licenses  = body.licenses ?? null;

  const reg = await prisma.registration.create({
    data: {
      companyName: body.companyName,
      companyNumber: body.companyNumber ?? null,
      registrationDate: body.registrationDate ? new Date(body.registrationDate) : null,

      registeredAddress: body.registeredAddress ?? null,
      correspondenceAddress: body.correspondenceAddress ?? null,
      website: body.website ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      fax: body.fax ?? null,

      authorisedCapital: body.authorisedCapital ?? null,
      paidUpCapital: body.paidUpCapital ?? null,
      dayakEquity: body.dayakEquity ?? null,

      contactPersonName: body.contactPersonName ?? null,
      contactPersonDesignation: body.contactPersonDesignation ?? null,
      contactPersonPhone: body.contactPersonPhone ?? null,

      directors,
      licenses,
      otherRegistrations: otherRegs,

      status: "PENDING",
    },
  });

  return NextResponse.json({ data: reg }, { status: 201 });
}
