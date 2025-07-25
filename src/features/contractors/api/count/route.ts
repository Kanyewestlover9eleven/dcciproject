// app/api/contractors/count/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const total = await prisma.contractor.count();
  return NextResponse.json({ total });
}
