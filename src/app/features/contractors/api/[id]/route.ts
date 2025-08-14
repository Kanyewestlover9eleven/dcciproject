import { NextResponse } from "next/server";
import { PrismaClient, MemberStatus } from "@prisma/client";

const prisma = new PrismaClient();
const toInt = (v: any) => (v === "" || v == null ? undefined : parseInt(String(v), 10));
const parseMaybeDate = (v: any): Date | undefined => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const b = await request.json();

  // whitelist allowed fields
  const data: any = {};
  if ("name" in b) data.name = b.name ?? null;
  if ("gender" in b) data.gender = b.gender ?? null;
  if ("age" in b) data.age = toInt(b.age) ?? null;
  if ("nationalId" in b) data.nationalId = b.nationalId ?? null;
  if ("membershipDate" in b) data.membershipDate = parseMaybeDate(b.membershipDate);
  if ("companyLicense" in b) data.companyLicense = b.companyLicense ?? null;
  if ("addressEmail" in b) data.addressEmail = b.addressEmail ?? null;
  if ("contactFax" in b) data.contactFax = b.contactFax ?? null;
  if ("region" in b) data.region = b.region ?? null;
  if ("coreBusiness" in b) data.coreBusiness = b.coreBusiness ?? null;
  if ("industryType" in b) data.industryType = b.industryType ?? null;
  if ("status" in b) data.status = b.status as MemberStatus;

  const updated = await prisma.contractor.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const contractor = await prisma.contractor.findUnique({ where: { id } });
  if (!contractor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contractor);
}
