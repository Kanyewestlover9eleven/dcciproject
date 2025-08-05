/*
  Warnings:

  - A unique constraint covering the columns `[fbPostId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('CAPACITY_BUILDING', 'BUSINESS_TALK', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivitySource" AS ENUM ('MANUAL', 'FACEBOOK');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "category" "ActivityCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "fbPostId" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "source" "ActivitySource" NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE UNIQUE INDEX "Activity_fbPostId_key" ON "Activity"("fbPostId");
