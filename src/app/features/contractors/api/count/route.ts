import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET() {
  const total = await prisma.contractor.count();
  return NextResponse.json({ total });
}
