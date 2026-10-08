/**
 * Imports a reviewed audit into the database as editorial reports.
 *
 *   npm run audit:import -- audit-results/2026-10-08.json            # as PENDING
 *   npm run audit:import -- audit-results/2026-10-08.json --publish  # published
 *
 * Remote databases (e.g. production) also need --remote. Re-running is safe:
 * a report with the same service and text is never inserted twice.
 */
import "dotenv/config";

import { readFileSync } from "node:fs";

import { PrismaPg } from "@prisma/adapter-pg";

import type { Prisma } from "../../src/generated/prisma/client";
import { PrismaClient } from "../../src/generated/prisma/client";
import { RDS_CA } from "../../src/lib/rds-ca";
import { normalizeName, slugify } from "../../src/lib/normalize";
import type { AuditResult } from "./scan";

const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
  "db",
  "postgres",
]);

function client(remoteAllowed: boolean) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const parsed = new URL(url);
  const local = LOCAL_HOSTS.has(parsed.hostname);
  if (!local && !remoteAllowed) {
    throw new Error(
      `${parsed.hostname} is not local: add --remote to import there.`,
    );
  }
  if (local)
    return {
      db: new PrismaClient({
        adapter: new PrismaPg({ connectionString: url }),
      }),
      host: parsed.hostname,
    };
  for (const key of [...parsed.searchParams.keys()])
    if (key.startsWith("ssl")) parsed.searchParams.delete(key);
  const ssl = parsed.hostname.endsWith(".rds.amazonaws.com")
    ? { ca: RDS_CA, rejectUnauthorized: true }
    : { rejectUnauthorized: true };
  return {
    db: new PrismaClient({
      adapter: new PrismaPg({ connectionString: parsed.toString(), ssl }),
    }),
    host: parsed.hostname,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file)
    throw new Error(
      "Usage: npm run audit:import -- <audit.json> [--publish] [--remote]",
    );
  const publish = args.includes("--publish");
  const audit = JSON.parse(readFileSync(file, "utf8")) as AuditResult;
  const auditedAt = new Date(audit.generatedAt);

  const { db, host } = client(args.includes("--remote"));
  let created = 0;
  let skipped = 0;
  try {
    for (const service of audit.services) {
      if (service.error || service.findings.length === 0) continue;
      const slug = slugify(service.name);
      const record = await db.service.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          name: service.name,
          nameNormalized: normalizeName(service.name),
          type: "WEBSITE",
        },
        select: { id: true },
      });
      for (const finding of service.findings) {
        const exists = await db.report.findFirst({
          where: {
            serviceId: record.id,
            source: "EDITORIAL",
            description: finding.text,
          },
          select: { id: true },
        });
        if (exists) {
          skipped++;
          continue;
        }
        await db.report.create({
          data: {
            serviceId: record.id,
            source: "EDITORIAL",
            submittedType: "WEBSITE",
            submittedName: service.name,
            description: finding.text,
            status: publish ? "PUBLISHED" : "PENDING",
            publishedAt: publish ? auditedAt : null,
            createdAt: auditedAt,
            evidence: {
              auditedAt: audit.generatedAt,
              tool: audit.tool,
              axeVersion: audit.axeVersion,
              rule: finding.rule,
              wcag: finding.wcag,
              pageUrl: finding.pageUrl,
              pageTitle: finding.pageTitle,
              count: finding.count,
              samples: finding.samples,
            } satisfies Prisma.InputJsonValue,
          },
        });
        created++;
      }
    }
  } finally {
    await db.$disconnect();
  }
  console.log(
    `${host}: ${created} segnalazioni ${publish ? "pubblicate" : "in attesa (PENDING)"}, ${skipped} già presenti.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
