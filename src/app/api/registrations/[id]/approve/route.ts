import { NextResponse } from "next/server";
import { PrismaClient, MemberStatus, RegistrationStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

function buildCompanyLicense(licenses: any): string | undefined {
  if (!licenses || typeof licenses !== "object") return undefined;
  const parts: string[] = [];
  if (licenses.cidb) {
    const g = licenses.cidbGrade ? ` ${licenses.cidbGrade}` : "";
    const s = licenses.cidbSubHeads ? ` (${licenses.cidbSubHeads})` : "";
    parts.push(`CIDB${g}${s}`.trim());
  }
  if (licenses.upkjStatus) {
    const g = licenses.upkjClass ? ` ${licenses.upkjClass}` : "";
    const s = licenses.upkjSubHeads ? ` (${licenses.upkjSubHeads})` : "";
    parts.push(`UPKJ${g}${s}`.trim());
  }
  if (licenses.upkStatus) {
    const g = licenses.upkClass ? ` ${licenses.upkClass}` : "";
    const s = licenses.upkSubHeads ? ` (${licenses.upkSubHeads})` : "";
    parts.push(`UPK${g}${s}`.trim());
  }
  if (licenses.ffo) parts.push("FFO");
  // new keys from Section B
  if (licenses.mof) parts.push("MOF");
  if (licenses.ePerolehan) parts.push("e-Perolehan");
  if (licenses.other) parts.push(String(licenses.other));
  return parts.length ? parts.join(" | ") : undefined;
}

function inferGenderFromMyKad(nric?: string): string | undefined {
  if (!nric) return undefined;
  const digits = nric.replace(/\D/g, "");
  if (digits.length < 1) return undefined;
  const last = Number(digits[digits.length - 1]);
  if (!Number.isFinite(last)) return undefined;
  return last % 2 ? "Male" : "Female"; // heuristic
}

function calcAge(dob?: string, fallback?: string): number | undefined {
  if (dob) {
    const d = new Date(dob);
    if (!Number.isNaN(+d)) {
      const now = new Date();
      let age = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
      return age;
    }
  }
  if (fallback) {
    const n = parseInt(fallback.replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const regId = Number(id);
  if (!Number.isFinite(regId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const reg = await prisma.registration.findUnique({ where: { id: regId } });
  if (!reg) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  if (reg.status !== RegistrationStatus.PENDING) {
    return NextResponse.json({ error: `Cannot approve a ${reg.status} registration` }, { status: 400 });
  }

  const full = (reg.licenses as any)?.__fullForm;
  const A = full?.sectionA ?? {};
  const B = full?.sectionB ?? {};
  const C = full?.sectionC ?? {};

  const addressEmail = [reg.registeredAddress, reg.correspondenceAddress, reg.email].filter(Boolean).join(" • ");
  const contactFax = [reg.phone, reg.fax].filter(Boolean).join(" / ");
  const companyLicense = buildCompanyLicense(reg.licenses);

  const contractor = await prisma.contractor.create({
    data: {
      name: reg.companyName,
      gender: (A.gender as string | undefined) ?? inferGenderFromMyKad(A.icNumber),
      age: calcAge(A.dateOfBirth, A.age),
      nationalId: A.icNumber || undefined,
      // prefer provided date, else approval timestamp
      membershipDate: reg.registrationDate ?? new Date(),
      companyLicense: companyLicense ?? undefined,
      addressEmail: addressEmail || undefined,
      contactFax: contactFax || undefined,
      // region: use most specific available
      region: A.division || A.district || A.hometown || undefined,
      // business fields
      coreBusiness: B.mainIndustry || C.serviceTypes || undefined,
      industryType: B.subIndustry || C.sector || undefined,
      status: MemberStatus.ACTIVE,
    },
  });

  await prisma.registration.update({
    where: { id: reg.id },
    data: { status: RegistrationStatus.APPROVED, contractorId: contractor.id },
  });

  return NextResponse.json({ ok: true, contractorId: contractor.id });
}
