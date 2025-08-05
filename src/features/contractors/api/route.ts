// app/api/contractors/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, LicenseType } from "@prisma/client";

const prisma = new PrismaClient();

/** Shape of one licence item sent from the frontend */
interface LicenceInput {
  type: keyof typeof LicenseType;   // "CIDB" | "UPKJ" | "UPK" | "FFO"
  gradeOrClass: string | null;
  subHeads: string | null;
}

export async function GET() {
  const contractors = await prisma.contractor.findMany({
    include: {
      directors: true,
      licenses:  true,
      otherRegs: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contractors);
}

export async function POST(request: Request) {
  const body = await request.json();

  // ───── basic validation ─────
  if (!body.companyName || !body.email) {
    return NextResponse.json(
      { error: "companyName and email are required" },
      { status: 400 },
    );
  }

  // ───── normalise incoming arrays ─────
  const directors = Array.isArray(body.directors)
    ? (body.directors as string[])
    : [];

  const licences: LicenceInput[] = Array.isArray(body.licenses)
    ? (body.licenses as LicenceInput[])
    : [];

  const otherRegs = Array.isArray(body.otherRegistrations)
    ? (body.otherRegistrations as string[])
    : [];

  // ───── create contractor ─────
  const contractor = await prisma.contractor.create({
    data: {
      companyName:      body.companyName,
      companyNumber:    body.companyNumber || undefined,
      registrationDate: body.registrationDate
        ? new Date(body.registrationDate)
        : undefined,

      registeredAddress:     body.registeredAddress,
      correspondenceAddress: body.correspondenceAddress,
      website:               body.website,
      email:                 body.email,
      phone:                 body.phone,
      fax:                   body.fax,

      authorisedCapital: body.authorisedCapital,
      paidUpCapital:     body.paidUpCapital,
      dayakEquity:
        body.dayakEquity !== undefined && body.dayakEquity !== ""
          ? parseFloat(body.dayakEquity)
          : undefined,

      contactPersonName:        body.contactPersonName,
      contactPersonDesignation: body.contactPersonDesignation,
      contactPersonPhone:       body.contactPersonPhone,

      directors: {
        create: directors.map((name) => ({ name })),
      },

      licenses: {
        create: licences.map(({ type, gradeOrClass, subHeads }) => ({
          type:        LicenseType[type], // cast string to enum
          gradeOrClass,
          subHeads,
        })),
      },

      otherRegs: {
        create: otherRegs.map((description) => ({ description })),
      },
    },
    include: { directors: true, licenses: true, otherRegs: true },
  });

  return NextResponse.json(contractor, { status: 201 });
}
