import { Signer } from "@aws-sdk/rds-signer";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import type { PoolConfig } from "pg";

import { RDS_CA } from "@/lib/rds-ca";

/**
 * Connessione al database.
 *
 * In produzione il database è Amazon Aurora PostgreSQL collegato tramite il
 * Marketplace di Vercel: nessuna password, l'accesso avviene con un token IAM
 * di 15 minuti firmato con le credenziali OIDC del progetto Vercel.
 * In locale (e in CI) si usa DATABASE_URL.
 */
type AuroraEnv = {
  host: string;
  port: number;
  user: string;
  database: string;
  region: string;
  roleArn: string;
};

function auroraEnv(): AuroraEnv | null {
  const { PGHOST, PGPORT, PGUSER, PGDATABASE, AWS_REGION, AWS_ROLE_ARN } =
    process.env;
  if (!PGHOST || !PGUSER || !AWS_REGION || !AWS_ROLE_ARN) return null;
  return {
    host: PGHOST,
    port: Number(PGPORT ?? 5432),
    user: PGUSER,
    database: PGDATABASE || "postgres",
    region: AWS_REGION,
    roleArn: AWS_ROLE_ARN,
  };
}

export function usesAurora(): boolean {
  return auroraEnv() !== null;
}

function signer(aurora: AuroraEnv) {
  return new Signer({
    hostname: aurora.host,
    port: aurora.port,
    username: aurora.user,
    region: aurora.region,
    credentials: awsCredentialsProvider({
      roleArn: aurora.roleArn,
      clientConfig: { region: aurora.region },
    }),
  });
}

/** Configurazione del pool `pg` per l'app. */
export function poolConfig(): PoolConfig {
  const aurora = auroraEnv();
  if (aurora) {
    const tokens = signer(aurora);
    return {
      host: aurora.host,
      port: aurora.port,
      user: aurora.user,
      database: aurora.database,
      // Il token viene firmato a ogni nuova connessione del pool.
      password: () => tokens.getAuthToken(),
      ssl: { ca: RDS_CA, rejectUnauthorized: true },
      max: 10,
      idleTimeoutMillis: 5_000,
    };
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Database non configurato: imposta DATABASE_URL o collega Aurora PostgreSQL.",
    );
  }
  return { connectionString: url };
}

/**
 * URL con un token IAM appena firmato, per `prisma migrate deploy` durante la
 * build. Restituisce DATABASE_URL quando Aurora non è collegato.
 */
export async function migrationUrl(caPath: string): Promise<string> {
  const aurora = auroraEnv();
  if (!aurora) {
    const url = process.env.DATABASE_URL;
    if (!url)
      throw new Error("Database non configurato: imposta DATABASE_URL.");
    return url;
  }
  const token = await signer(aurora).getAuthToken();
  const params = new URLSearchParams({ sslmode: "require", sslcert: caPath });
  return `postgresql://${encodeURIComponent(aurora.user)}:${encodeURIComponent(token)}@${aurora.host}:${aurora.port}/${encodeURIComponent(aurora.database)}?${params}`;
}
