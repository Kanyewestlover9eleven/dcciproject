/*
  Warnings:

  - You are about to drop the column `address` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `registeredAt` on the `Contractor` table. All the data in the column will be lost.
  - Added the required column `companyName` to the `Contractor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('CIDB', 'UPKJ', 'UPK', 'FFO');

-- AlterTable
ALTER TABLE "Contractor" DROP COLUMN "address",
DROP COLUMN "category",
DROP COLUMN "location",
DROP COLUMN "name",
DROP COLUMN "registeredAt",
ADD COLUMN     "authorisedCapital" TEXT,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "companyNumber" TEXT,
ADD COLUMN     "contactPersonDesignation" TEXT,
ADD COLUMN     "contactPersonName" TEXT,
ADD COLUMN     "contactPersonPhone" TEXT,
ADD COLUMN     "correspondenceAddress" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dayakEquity" DOUBLE PRECISION,
ADD COLUMN     "fax" TEXT,
ADD COLUMN     "paidUpCapital" TEXT,
ADD COLUMN     "registeredAddress" TEXT,
ADD COLUMN     "registrationDate" TIMESTAMP(3),
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "Director" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contractorId" INTEGER NOT NULL,

    CONSTRAINT "Director_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" SERIAL NOT NULL,
    "type" "LicenseType" NOT NULL,
    "gradeOrClass" TEXT,
    "subHeads" TEXT,
    "contractorId" INTEGER NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherRegistration" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "contractorId" INTEGER NOT NULL,

    CONSTRAINT "OtherRegistration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Director" ADD CONSTRAINT "Director_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherRegistration" ADD CONSTRAINT "OtherRegistration_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
