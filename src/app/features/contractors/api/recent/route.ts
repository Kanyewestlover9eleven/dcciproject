import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";

const prisma = new PrismaClient();
const pickEmail = (s?: string | null) => {
  if (!s) return "";
  const m = s.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : "";
};

export async function GET() {
  // “Pending” is ambiguous now; show the 10 most recent rows
  const rows = await prisma.contractor.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true, name: true, addressEmail: true, createdAt: true,
    },
  });

  const items = rows.map(r => ({
    id: r.id,
    name: r.name ?? "Unknown",
    email: pickEmail(r.addressEmail),
    submitted: new Date(r.createdAt).toLocaleDateString(),
  }));

  return NextResponse.json(items);
}
