/*
  Warnings:

  - The `companyLicense` column on the `Contractor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Contractor" DROP COLUMN "companyLicense",
ADD COLUMN     "companyLicense" INTEGER;
