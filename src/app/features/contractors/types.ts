// src/features/contractors/types.ts

export interface Director {
  id: number
  name: string
}

export interface License {
  id: number
  type: string
  gradeOrClass?: string
  subHeads?: string
}

export interface OtherReg {
  id: number
  description: string
}

export type Contractor = {
  id: number;
  name?: string | null;
  age?: number | null;
  gender?: string | null;
  nationalId?: string | null;
  membershipDate?: string | null;
  companyLicense?: string | null;
  addressEmail?: string | null;
  contactFax?: string | null;
  region?: string | null;
  coreBusiness?: string | null;
  industryType?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "DECEASED" | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

