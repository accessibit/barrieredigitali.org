-- CreateEnum
CREATE TYPE "ServiceKind" AS ENUM ('WEBSITE', 'APP', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_normalized" TEXT NOT NULL,
    "kind" "ServiceKind" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "service_id" TEXT,
    "submitted_kind" "ServiceKind" NOT NULL,
    "submitted_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "email" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_name_normalized_idx" ON "services"("name_normalized");

-- CreateIndex
CREATE INDEX "reports_service_id_status_published_at_idx" ON "reports"("service_id", "status", "published_at");

-- CreateIndex
CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
