import "server-only";

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variabile d'ambiente mancante: ${key}`);
  }
  return value;
}

export const env = {
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
  get SITE_URL() {
    return process.env.SITE_URL ?? "https://barrieredigitali.org";
  },
};

/** Fails fast at server start if a required variable is missing. */
export function assertEnv() {
  void env.DATABASE_URL;
}
