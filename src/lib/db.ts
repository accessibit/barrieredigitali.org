import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { attachDatabasePool } from "@vercel/functions";
import { Pool, type PoolConfig } from "pg";

import { PrismaClient } from "@/generated/prisma/client";
import { RDS_CA } from "@/lib/rds-ca";

/**
 * Builds the `pg` pool config from DATABASE_URL.
 *
 * Amazon RDS: TLS is required and the server certificate is verified against
 * the RDS CA, which Node does not trust by default. The `ssl*` URL params
 * (e.g. `sslmode=require`, used by the Prisma CLI) are stripped because they
 * would override the `ssl` option. Locally (Docker) the URL is used as is.
 */
function poolConfig(): PoolConfig {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  const parsed = new URL(url);
  if (!parsed.hostname.endsWith(".rds.amazonaws.com")) {
    return { connectionString: url };
  }
  for (const key of [...parsed.searchParams.keys()]) {
    if (key.startsWith("ssl")) parsed.searchParams.delete(key);
  }
  return {
    connectionString: parsed.toString(),
    ssl: { ca: RDS_CA, rejectUnauthorized: true },
    max: 10,
    idleTimeoutMillis: 5_000,
  };
}

function createClient() {
  const pool = new Pool(poolConfig());
  // On Vercel, closes idle connections before the function is suspended.
  attachDatabasePool(pool);
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
