-- Rename "kind" to "type" (enum and columns), keeping existing data.
ALTER TYPE "ServiceKind" RENAME TO "ServiceType";
ALTER TABLE "services" RENAME COLUMN "kind" TO "type";
ALTER TABLE "reports" RENAME COLUMN "submitted_kind" TO "submitted_type";
