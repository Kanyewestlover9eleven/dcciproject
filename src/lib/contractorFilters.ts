// src/lib/contractorFilters.ts
import { Prisma } from "@prisma/client";

type Filters = {
  status?: string[];
  gender?: string[];
  region?: string[];
  industryType?: string[];
  ageMin?: string | number;
  ageMax?: string | number;
};

const normalizeStatus = (arr?: string[]) =>
  (arr ?? [])
    .map(s => s.trim().toUpperCase())
    .filter(s => ["ACTIVE", "INACTIVE", "DECEASED"].includes(s)) as Array<"ACTIVE"|"INACTIVE"|"DECEASED">;

export function buildWhereFromFilters(filters: Filters): Prisma.ContractorWhereInput {
  const AND: Prisma.ContractorWhereInput[] = [];

  // status (enum)
  const st = normalizeStatus(filters.status);
  if (st.length) {
    AND.push({ status: { in: st as any } });
  }

  // gender (free text)
  if (filters.gender?.length) {
    AND.push({
      gender: { in: filters.gender.map(g => g.trim()).filter(Boolean) }
    });
  }

  // region / industryType (free text)
  if (filters.region?.length) {
    AND.push({ region: { in: filters.region.map(r => r.trim()).filter(Boolean) } });
  }
  if (filters.industryType?.length) {
    AND.push({ industryType: { in: filters.industryType.map(i => i.trim()).filter(Boolean) } });
  }

  // age range
  const ageMin = Number.isFinite(Number(filters.ageMin)) ? Number(filters.ageMin) : undefined;
  const ageMax = Number.isFinite(Number(filters.ageMax)) ? Number(filters.ageMax) : undefined;
  if (ageMin != null || ageMax != null) {
    AND.push({
      age: {
        gte: ageMin ?? undefined,
        lte: ageMax ?? undefined,
      },
    });
  }

  return AND.length ? { AND } : {};
}
