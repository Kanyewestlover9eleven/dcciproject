// app/api/contractors/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, LicenseType } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const contractors = await prisma.contractor.findMany({
    include: {
      directors: true,
      licenses: true,
      otherRegs: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contractors);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Basic server-side validation (you can replace with Zod)
  if (!body.companyName || !body.email) {
    return NextResponse.json(
      { error: "companyName and email are required" },
      { status: 400 }
    );
  }

  const contractor = await prisma.contractor.create({
    data: {
      companyName:            body.companyName,
      companyNumber:          body.companyNumber || undefined,
      registrationDate:       body.registrationDate ? new Date(body.registrationDate) : undefined,

      registeredAddress:     body.registeredAddress,
      correspondenceAddress: body.correspondenceAddress,
      website:               body.website,
      email:                 body.email,
      phone:                 body.phone,
      fax:                   body.fax,

      authorisedCapital: body.authorisedCapital,
      paidUpCapital:     body.paidUpCapital,
      dayakEquity:       body.dayakEquity ? parseFloat(body.dayakEquity) : undefined,

      contactPersonName:        body.contactPersonName,
      contactPersonDesignation: body.contactPersonDesignation,
      contactPersonPhone:       body.contactPersonPhone,

      directors: {
        create: Array.isArray(body.directors)
          ? body.directors.map((name: string) => ({ name }))
          : [],
      },
      licenses: {
        create: Array.isArray(body.licenses)
          ? body.licenses.map((l: ) => ({
              type:        LicenseType[l.type as keyof typeof LicenseType],
              gradeOrClass: l.gradeOrClass,
              subHeads:     l.subHeads,
            }))
          : [],
      },
      otherRegs: {
        create: Array.isArray(body.otherRegistrations)
          ? body.otherRegistrations.map((desc: string) => ({ description: desc }))
          : [],
      },
    },
    include: { directors: true, licenses: true, otherRegs: true },
  });

  return NextResponse.json(contractor, { status: 201 });
}
