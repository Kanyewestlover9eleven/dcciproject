/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."BlastStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

-- DropTable
DROP TABLE "public"."Activity";

-- DropEnum
DROP TYPE "public"."ActivityCategory";

-- DropEnum
DROP TYPE "public"."ActivitySource";

-- CreateTable
CREATE TABLE "public"."Audience" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Template" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "emailBody" TEXT NOT NULL,
    "waBody" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlastJob" (
    "id" SERIAL NOT NULL,
    "audienceId" INTEGER,
    "templateId" INTEGER,
    "filters" JSONB,
    "subject" TEXT,
    "emailBody" TEXT,
    "waBody" TEXT,
    "channelEmail" BOOLEAN NOT NULL DEFAULT false,
    "channelWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "total" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."BlastStatus" NOT NULL DEFAULT 'QUEUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "BlastJob_pkey" PRIMARY KEY ("id")
);
