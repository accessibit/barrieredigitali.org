-- CreateEnum
CREATE TYPE "ReportSource" AS ENUM ('PUBLIC', 'EDITORIAL');

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "evidence" JSONB,
ADD COLUMN     "source" "ReportSource" NOT NULL DEFAULT 'PUBLIC';

