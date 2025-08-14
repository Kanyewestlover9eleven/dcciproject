// app/api/contractors/import/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// ----- helpers -----
const emptyToUndef = (v: any) =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "")
    ? undefined
    : v;

const toText = (v: any): string | undefined => {
  const x = emptyToUndef(v);
  return x === undefined ? undefined : String(x).trim();
};

const toStatus = (v: any): "ACTIVE" | "INACTIVE" | "DECEASED" | undefined => {
  const s = String(v || "").toLowerCase();
  if (!s) return undefined;
  if (/deceas|passed|late|rip/.test(s)) return "DECEASED";
  if (/inactive|resign|expired|terminate|suspend/.test(s)) return "INACTIVE";
  if (/active/.test(s)) return "ACTIVE";
  return undefined;
};


const toInt = (v: any): number | undefined => {
  const s = toText(v);
  if (!s) return undefined;
  const n = parseInt(s.match(/\d+/)?.[0] ?? "", 10);
  return Number.isNaN(n) ? undefined : n;
};

const parseMaybeDate = (v: any): Date | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  if (typeof v === "number") {
    // Excel serial date (1900 system)
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(epoch.getTime() + v * 86400000);
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
};

const isAllEmpty = (o: Record<string, any>) =>
  Object.values(o).every((v) => v === undefined);

const norm = (s: any) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

// Map header labels -> fields in your Prisma model
const targets: Record<string, string[]> = {
  name: ["name", "companyname", "membername"],
  gender: ["gender", "sex"],
  age: ["age"], // <-- added

  // ID column shows as "ID NO"
  nationalId: [
    "id",
    "idno",
    "nric",
    "ic",
    "icno",
    "icnumber",
    "identitycard",
    "identificationno",
    "nationalid",
  ],

  // "MEMBER NO/DATE OF MEMBERSHIP"
  membershipDate: [
    "dateofmembership",
    "membershipdate",
    "datejoined",
    "joineddate",
    "memberfrom",
    "membernodateofmembership",
  ],

  // "COMPANY LICENSE NO"
  companyLicense: ["companylicense", "companylicence", "companylicenseno", "licence", "license"],

  // "ADDRESS (BUSINESS/POSTAL) E-MAIL ADDRESS"
  addressEmail: [
    "addressemailaddress",
    "addressbusinesspostalemailaddress",
    "addressbusinesspostalemail",
    "addressandemail",
    "emailaddress",
    "address",
    "email",
  ],

  // "CONTACT NO/ FAX NO"
  contactFax: [
    "contactnofaxno",
    "contactfax",
    "contact",
    "phonefax",
    "telephonefax",
    "phone",
    "telephone",
    "fax",
    "contactno",
  ],

  region: ["region", "area", "state", "division"],

  // "CORE BUSINESS (CATEGORY)"
  coreBusiness: [
    "corebusiness",
    "corebusinesscategory",
    "natureofbusiness",
    "businessnature",
    "business",
  ],

  // "TYPE OF INDUSTRY"
  industryType: ["typeofindustry", "industrytype", "industry"],

  status: ["status", "memberstatus", "remarks", "note"],
};

// find header row index in AoA by matching at least 3 target columns
function findHeaderRowIndex(rows: any[][]): number {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const row = rows[i] || [];
    const hits = new Set<string>();
    for (let c = 0; c < row.length; c++) {
      const label = norm(row[c]);
      if (!label) continue;
      for (const [field, variants] of Object.entries(targets)) {
        if (variants.includes(label)) hits.add(field);
      }
    }
    if (hits.size >= 3) return i;
  }
  return -1;
}

// build column index -> field mapping from header row
function buildColMap(header: any[]): Record<number, keyof typeof targets> {
  const map: Record<number, keyof typeof targets> = {};
  for (let c = 0; c < header.length; c++) {
    const label = norm(header[c]);
    for (const [field, variants] of Object.entries(targets)) {
      if (variants.includes(label)) {
        map[c] = field as keyof typeof targets;
        break;
      }
    }
  }
  return map;
}

export async function POST(req: Request) {
  const body = await req.json();

  // Accept: AoA directly OR { data: AoA } OR array of objects (fallback)
  let rows: any = Array.isArray(body) ? body : body?.data;
  if (!Array.isArray(rows)) {
    return NextResponse.json(
      { error: "Expected array or { data: array }" },
      { status: 400 }
    );
  }

  // -------- Array-of-arrays path (preferred) --------
  if (Array.isArray(rows[0])) {
    const aoa = rows as any[][];
    const headerIdx = findHeaderRowIndex(aoa);
    if (headerIdx === -1) {
      return NextResponse.json(
        { imported: 0, note: "No header row detected in first 30 rows" },
        { status: 200 }
      );
    }

    const header = aoa[headerIdx] || [];
    const colMap = buildColMap(header);
    console.log("IMPORT header row index:", headerIdx);
    console.log("IMPORT mapped columns:", colMap);

    const mapped: any[] = [];
    for (let r = headerIdx + 1; r < aoa.length; r++) {
      const row = aoa[r] || [];
      const obj: Record<string, any> = {};
      for (const [colStr, field] of Object.entries(colMap)) {
        const col = Number(colStr);
        const val = row[col];
        switch (field) {
          case "membershipDate":
            obj.membershipDate = parseMaybeDate(val);
            break;
          case "age": // <-- now handled
            obj.age = toInt(val);
            break;          
          case "status":
            obj.status = toStatus(val);
            break;
          default:
            obj[field] = toText(val);
        }
      }
      if (!isAllEmpty(obj)) {
        if (!obj.name) obj.name = "Unknown";
        mapped.push(obj);
      }
    }

    if (mapped.length === 0) {
      return NextResponse.json(
        { imported: 0, note: "No usable rows after header" },
        { status: 200 }
      );
    }

    const result = await prisma.contractor.createMany({
      data: mapped,
      skipDuplicates: false,
    });
    return NextResponse.json({ imported: result.count }, { status: 201 });
  }

  // -------- Fallback: array of objects with headers --------
  const objRows = rows as Array<Record<string, any>>;
  const firstKeys = Object.keys(objRows[0] || {});
  const emptyKeyRatio =
    firstKeys.filter((k) => k.startsWith("__EMPTY")).length /
    Math.max(firstKeys.length, 1);
  if (emptyKeyRatio > 0.5) {
    return NextResponse.json(
      {
        imported: 0,
        note:
          "Detected placeholder headers (__EMPTY...). Re-import using AoA (client header:1).",
      },
      { status: 200 }
    );
  }

  const normRow = (r: Record<string, any>) => {
    const o: Record<string, any> = {};
    for (const [k, v] of Object.entries(r)) o[norm(k)] = v;
    return o;
  };
  const pick = (nr: Record<string, any>, keys: string[]) => {
    for (const k of keys) {
      const v = nr[k];
      if (v !== undefined && v !== "") return v;
    }
    return undefined;
  };

  const mapped = objRows
    .map((r) => {
      const nr = normRow(r);
      const obj = {
        name: toText(pick(nr, targets.name)),
        gender: toText(pick(nr, targets.gender)),
        age: toInt(pick(nr, targets.age)), // <-- now handled
        nationalId: toText(pick(nr, targets.nationalId)),
        membershipDate: parseMaybeDate(pick(nr, targets.membershipDate)),
        companyLicense: toText(pick(nr, targets.companyLicense)),
        addressEmail: toText(pick(nr, targets.addressEmail)),
        contactFax: toText(pick(nr, targets.contactFax)),
        region: toText(pick(nr, targets.region)),
        coreBusiness: toText(pick(nr, targets.coreBusiness)),
        industryType: toText(pick(nr, targets.industryType)),
        status: toStatus(pick(nr, targets.status)) ?? "ACTIVE",
      } as any;

      if (!obj.name && !isAllEmpty(obj)) obj.name = "Unknown";
      return obj;
    })
    .filter((o) => !isAllEmpty(o));

  if (mapped.length === 0) {
    return NextResponse.json(
      { imported: 0, note: "No usable fields matched your headers" },
      { status: 200 }
    );
  }

  const result = await prisma.contractor.createMany({
    data: mapped,
    skipDuplicates: false,
  });
  return NextResponse.json({ imported: result.count }, { status: 201 });
}
