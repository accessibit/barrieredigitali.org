/**
 * Applica le migrazioni durante la build di produzione su Vercel.
 *
 * Con Aurora (accesso IAM) non esiste una password fissa: firma un token
 * valido 15 minuti e lo passa a `prisma migrate deploy` come DATABASE_URL.
 */
import "dotenv/config";

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { migrationUrl, usesAurora } from "../src/lib/db-connection";
import { RDS_CA } from "../src/lib/rds-ca";

async function main() {
  const caPath = path.join(
    mkdtempSync(path.join(tmpdir(), "rds-ca-")),
    "rds-ca.pem",
  );
  writeFileSync(caPath, RDS_CA);

  const url = await migrationUrl(caPath);
  console.log(
    `Migrazioni su ${usesAurora() ? "Aurora PostgreSQL (IAM)" : "DATABASE_URL"}…`,
  );

  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
  process.exit(result.status ?? 1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
