/**
 * Demo data for local development (see `seed-data.ts`).
 *
 * Refuses to run against a non-local database: in production only
 * `prisma migrate deploy` is run.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { normalizeName, slugify } from "../src/lib/normalize";
import { SEED_SERVICES, seedReports } from "./seed-data";

const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
  "db",
  "postgres",
]);

function assertLocalDatabase(url: string | undefined): string {
  if (!url) throw new Error("DATABASE_URL non è impostata.");
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("Seed rifiutato: ambiente di produzione.");
  }
  const host = new URL(url).hostname;
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(`Seed rifiutato: il database "${host}" non è locale.`);
  }
  return url;
}

async function main() {
  const url = assertLocalDatabase(process.env.DATABASE_URL);
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  const today = new Date();
  const base = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
    12,
  );
  const at = (daysAgo: number) => new Date(base - daysAgo * 86_400_000);

  try {
    await db.report.deleteMany();
    await db.service.deleteMany();

    let reportCount = 0;
    for (const [index, service] of SEED_SERVICES.entries()) {
      const reports = seedReports(service, index);
      reportCount += reports.length;
      await db.service.create({
        data: {
          slug: slugify(service.name),
          name: service.name,
          nameNormalized: normalizeName(service.name),
          type: service.type,
          reports: {
            createMany: {
              data: reports.map((r) => ({
                submittedType: service.type,
                submittedName: service.name,
                description: r.text,
                status: "PUBLISHED" as const,
                createdAt: at(r.daysAgo + 1),
                publishedAt: at(r.daysAgo),
              })),
            },
          },
        },
      });
    }

    // A few reports awaiting review, to try out moderation in Prisma Studio.
    await db.report.createMany({
      data: [
        {
          submittedType: "WEBSITE",
          submittedName: "comune.genova.it",
          description:
            "Il modulo per il cambio di residenza non si compila con la tastiera.",
          status: "PENDING",
        },
        {
          submittedType: "APP",
          submittedName: "App Trenord",
          description:
            "Il QR del biglietto non ha un'alternativa testuale per il lettore di schermo.",
          status: "PENDING",
        },
      ],
    });

    console.log(
      `Seed completato: ${SEED_SERVICES.length} servizi, ${reportCount} segnalazioni pubblicate.`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
