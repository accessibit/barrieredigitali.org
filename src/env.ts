import "server-only";

import { poolConfig } from "@/lib/db-connection";

export const env = {
  get SITE_URL() {
    return process.env.SITE_URL ?? "https://barrieredigitali.org";
  },
};

/** Fallisce subito all'avvio del server se il database non è configurato. */
export function assertEnv() {
  poolConfig();
}
