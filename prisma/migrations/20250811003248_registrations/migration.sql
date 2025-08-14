-- CreateEnum
CREATE TYPE "public"."RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."Registration" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyNumber" TEXT,
    "registrationDate" TIMESTAMP(3),
    "registeredAddress" TEXT,
    "correspondenceAddress" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "authorisedCapital" TEXT,
    "paidUpCapital" TEXT,
    "dayakEquity" TEXT,
    "contactPersonName" TEXT,
    "contactPersonDesignation" TEXT,
    "contactPersonPhone" TEXT,
    "directors" JSONB,
    "licenses" JSONB,
    "otherRegistrations" JSONB,
    "status" "public"."RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "contractorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Registration" ADD CONSTRAINT "Registration_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "public"."Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
