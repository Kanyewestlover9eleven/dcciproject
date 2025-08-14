// src/app/api/registrations/[id]/pdf/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // params must be awaited
) {
  const { id } = await ctx.params;
  const num = Number(id);
  if (!Number.isFinite(num)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const reg = await prisma.registration.findUnique({ where: { id: num } });
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { PDFDocument, StandardFonts } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const A4: [number, number] = [595.28, 841.89];
  let page = pdfDoc.addPage(A4);
  const margin = 48;
  const lineH = 14;
  let y = A4[1] - margin;

  const s = (v: unknown) => (v == null || v === "" ? "-" : String(v));
  const fmtDate = (d: any) => {
    if (!d) return "-";
    const dt = d instanceof Date ? d : new Date(d);
    return Number.isNaN(+dt) ? "-" : dt.toDateString();
  };

  const drawTitle = (t: string) => {
    y -= 6;
    page.drawText(t, { x: margin, y, size: 14, font: fontBold });
    y -= lineH;
  };
  const drawLine = (label: string, val: string) => {
    const text = `${label}: ${val}`;
    wrap(text);
  };
  const wrap = (text: string, size = 11) => {
    const maxWidth = A4[0] - margin * 2;
    const words = text.split(/\s+/);
    let line = "";
    for (const w of words) {
      const trial = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(trial, size) > maxWidth) {
        ensurePage(lineH);
        page.drawText(line, { x: margin, y, size, font });
        y -= lineH;
        line = w;
      } else {
        line = trial;
      }
    }
    if (line) {
      ensurePage(lineH);
      page.drawText(line, { x: margin, y, size, font });
      y -= lineH;
    }
  };
  const ensurePage = (needed: number) => {
    if (y - needed < margin) {
      page = pdfDoc.addPage(A4);
      y = A4[1] - margin;
    }
  };

  // Header
  page.drawText("DCCI Membership Application", {
    x: margin,
    y,
    size: 18,
    font: fontBold,
  });
  y -= lineH * 2;
  wrap(`Submitted: ${fmtDate(reg.createdAt)}`, 10);
  y -= 6;

  // Summary
  drawTitle("Company");
  drawLine("Name", s(reg.companyName));
  drawLine("Company No", s(reg.companyNumber));
  drawLine("Registration Date", fmtDate(reg.registrationDate));

  drawTitle("Contacts");
  drawLine("Website", s(reg.website));
  drawLine("Email", s(reg.email));
  drawLine("Phone", s(reg.phone));
  drawLine("Fax", s(reg.fax));

  drawTitle("Addresses");
  drawLine("Registered Address", s(reg.registeredAddress));
  drawLine("Correspondence Address", s(reg.correspondenceAddress));

  drawTitle("Financial");
  drawLine("Authorised Capital", s(reg.authorisedCapital));
  drawLine("Paid Up Capital", s(reg.paidUpCapital));
  drawLine("Dayak Equity", s(reg.dayakEquity));

  drawTitle("Contact Person");
  drawLine("Name", s(reg.contactPersonName));
  drawLine("Designation", s(reg.contactPersonDesignation));
  drawLine("Phone", s(reg.contactPersonPhone));

  const pretty = (v: any) => {
    try {
      return JSON.stringify(v ?? null, null, 2);
    } catch {
      return "<unserializable>";
    }
  };

  drawTitle("Directors");
  wrap(pretty(reg.directors), 9);

  drawTitle("Licenses");
  wrap(pretty(reg.licenses), 9);

  drawTitle("Other Registrations");
  wrap(pretty(reg.otherRegistrations), 9);

  // Full form on a new page, if present
  const full = (reg.licenses as any)?.__fullForm;
  if (full) {
    page = pdfDoc.addPage(A4);
    y = A4[1] - margin;
    page.drawText("Full Application (Sections A–E)", {
      x: margin,
      y,
      size: 16,
      font: fontBold,
    });
    y -= lineH * 2;

    // A
    drawTitle("SECTION A: PERSONAL DETAIL");
    const A = full.sectionA || {};
    drawLine("Applicant", s(A.applicantName));
    drawLine("IC", s(A.icNumber));
    drawLine("DOB", s(A.dateOfBirth));
    drawLine("Age", s(A.age));
    drawLine("Permanent Address", s(A.permanentAddress));
    drawLine("Postal Address", s(A.postalAddress));
    drawLine("Office", s(A.contactOffice));
    drawLine("Email", s(A.contactEmail));
    drawLine("HP", s(A.contactHP));
    drawLine(
      "Hometown / District / Division",
      [A.hometown, A.district, A.division].filter(Boolean).join(" / ") || "-"
    );

    // B or C
    if (full.isBusinessOwner) {
      drawTitle("SECTION B: BUSINESS INFORMATION");
      const B = full.sectionB || {};
      const L = B.licenses || {};
      const lic = [
        L.cidb ? `CIDB${L.cidbGrade ? " " + L.cidbGrade : ""}${L.cidbSubHeads ? " (" + L.cidbSubHeads + ")" : ""}` : null,
        L.mof ? "MOF" : null,
        L.ePerolehan ? "e-Perolehan" : null,
        L.other || null,
      ]
        .filter(Boolean)
        .join(" | ");
      drawLine("Business Setup", s(B.businessSetup) + (B.businessSetup === "OTHERS" && B.businessSetupOther ? ` (${B.businessSetupOther})` : ""));
      drawLine("Company Size", s(B.companySize));
      drawLine("Industry", `${s(B.mainIndustry)} / ${s(B.subIndustry)}`);
      drawLine("Organization", s(B.orgName));
      drawLine("Business Address", s(B.businessAddress));
      drawLine("Business Reg No", s(B.businessRegNo));
      drawLine("Ownership", s(B.ownershipName));
      drawLine("Highest Academic", s(B.highestAcademic));
      drawLine("Skills Cert", s(B.skillsCert));
      drawLine("Licenses", lic || "-");
    } else {
      drawTitle("SECTION C: PROFESSIONAL SERVICES");
      const C = full.sectionC || {};
      drawLine("Sector", s(C.sector));
      drawLine("Types of Services", s(C.serviceTypes));
      drawLine("Organization", s(C.orgName));
      drawLine("Address", s(C.address));
      drawLine("Position / Dept", s(C.positionDept));
      drawLine("Highest Academic", s(C.highestAcademic));
      drawLine("Skills Cert", s(C.skillsCert));
      drawLine("Other Qualification", s(C.otherQualification));
    }

    // D
    drawTitle("SECTION D: PERSON TO CONTACT");
    const D = full.sectionD?.contacts || [];
    (D as any[]).forEach((c: any, i: number) => {
      wrap(`Contact ${i + 1}`, 12);
      drawLine("Name", s(c?.fullName));
      drawLine("IC", s(c?.icNumber));
      drawLine("Relationship", s(c?.relationship));
      drawLine("Profession", s(c?.profession));
      drawLine("Address", s(c?.address));
      drawLine("HP / Home / Email", [c?.hp, c?.homePhone, c?.email].filter(Boolean).join(" / ") || "-");
      drawLine(
        "Hometown / District / Division",
        [c?.hometown, c?.district, c?.division].filter(Boolean).join(" / ") || "-"
      );
      y -= 6;
    });

    // E
    drawTitle("SECTION E: PROPOSER & SECONDER");
    const E = full.sectionE || {};
    drawLine("Proposer", `${s(E.proposerName)} • Sign: ${s(E.proposerSignature)} • Date: ${s(E.proposerDate)}`);
    drawLine("Seconder", `${s(E.seconderName)} • Sign: ${s(E.seconderSignature)} • Date: ${s(E.seconderDate)}`);

    // Declaration
    drawTitle("Declaration");
    wrap(`Agreed: ${full.declarationAgreed ? "Yes" : "No"}`, 10);
  }

  const bytes = await pdfDoc.save(); // Uint8Array
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="registration-${reg.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
