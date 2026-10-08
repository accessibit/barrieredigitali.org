-- AlterTable
ALTER TABLE "reports" ADD COLUMN "ip_hash" TEXT;

-- CreateIndex
CREATE INDEX "reports_ip_hash_created_at_idx" ON "reports"("ip_hash", "created_at");
