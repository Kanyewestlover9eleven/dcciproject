/*
  Warnings:

  - You are about to drop the column `address` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Contractor` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Contractor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Contractor_age_idx";

-- DropIndex
DROP INDEX "public"."Contractor_gender_idx";

-- DropIndex
DROP INDEX "public"."Contractor_industryType_idx";

-- DropIndex
DROP INDEX "public"."Contractor_region_idx";

-- DropIndex
DROP INDEX "public"."Contractor_status_idx";

-- AlterTable
ALTER TABLE "public"."Contractor" DROP COLUMN "address",
DROP COLUMN "category",
DROP COLUMN "email",
DROP COLUMN "phone",
DROP COLUMN "status";
