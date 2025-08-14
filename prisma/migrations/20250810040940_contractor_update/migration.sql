-- CreateEnum
CREATE TYPE "public"."MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DECEASED');

-- AlterTable
ALTER TABLE "public"."Contractor" ADD COLUMN     "address" TEXT,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "public"."MemberStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Contractor_region_idx" ON "public"."Contractor"("region");

-- CreateIndex
CREATE INDEX "Contractor_industryType_idx" ON "public"."Contractor"("industryType");

-- CreateIndex
CREATE INDEX "Contractor_gender_idx" ON "public"."Contractor"("gender");

-- CreateIndex
CREATE INDEX "Contractor_status_idx" ON "public"."Contractor"("status");

-- CreateIndex
CREATE INDEX "Contractor_age_idx" ON "public"."Contractor"("age");
