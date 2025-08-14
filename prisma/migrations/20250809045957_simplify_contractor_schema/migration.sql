/*
  Warnings:

  - You are about to drop the column `authorisedCapital` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `companyNumber` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `contactPersonDesignation` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `contactPersonName` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `contactPersonPhone` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `correspondenceAddress` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `dayakEquity` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `fax` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `paidUpCapital` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `registeredAddress` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `registrationDate` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the `Director` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `License` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtherRegistration` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Contractor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Director" DROP CONSTRAINT "Director_contractorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."License" DROP CONSTRAINT "License_contractorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OtherRegistration" DROP CONSTRAINT "OtherRegistration_contractorId_fkey";

-- DropIndex
DROP INDEX "public"."Contractor_email_key";

-- AlterTable
ALTER TABLE "public"."Contractor" DROP COLUMN "authorisedCapital",
DROP COLUMN "companyName",
DROP COLUMN "companyNumber",
DROP COLUMN "contactPersonDesignation",
DROP COLUMN "contactPersonName",
DROP COLUMN "contactPersonPhone",
DROP COLUMN "correspondenceAddress",
DROP COLUMN "dayakEquity",
DROP COLUMN "email",
DROP COLUMN "fax",
DROP COLUMN "paidUpCapital",
DROP COLUMN "phone",
DROP COLUMN "registeredAddress",
DROP COLUMN "registrationDate",
DROP COLUMN "status",
DROP COLUMN "website",
ADD COLUMN     "addressEmail" TEXT,
ADD COLUMN     "companyLicense" TEXT,
ADD COLUMN     "contactFax" TEXT,
ADD COLUMN     "coreBusiness" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "industryType" TEXT,
ADD COLUMN     "membershipDate" TIMESTAMP(3),
ADD COLUMN     "name" TEXT,
ADD COLUMN     "nationalId" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."Director";

-- DropTable
DROP TABLE "public"."License";

-- DropTable
DROP TABLE "public"."OtherRegistration";

-- DropEnum
DROP TYPE "public"."LicenseType";
