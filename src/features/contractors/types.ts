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

export interface Contractor {
  id: number
  companyName: string
  companyNumber: string | null
  registrationDate: string | null
  registeredAddress: string | null
  correspondenceAddress: string | null
  website: string | null
  email: string
  phone: string | null
  fax: string | null
  authorisedCapital: string | null
  paidUpCapital: string | null
  dayakEquity: number | null
  contactPersonName: string | null
  contactPersonDesignation: string | null
  contactPersonPhone: string | null
  status: string
  createdAt: string
  directors: Director[]
  licenses: License[]
  otherRegs: OtherReg[]
}
