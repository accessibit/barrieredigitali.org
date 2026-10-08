/**
 * Contacts and organization details. Until they are defined they remain
 * placeholders, highlighted on the pages as in the design.
 */
/** Public URL of the site (sitemap, robots.txt, canonical and Open Graph URLs). */
export const SITE_URL = process.env.SITE_URL ?? "https://barrieredigitali.org";

export const SITE = {
  name: "Barriere Digitali",
  editorialEmail: null as string | null, // [EMAIL REDAZIONE]
  pressEmail: null as string | null, // [EMAIL STAMPA]
  pressPhone: null as string | null, // [TELEFONO]
  privacyEmail: null as string | null, // [EMAIL PRIVACY]
  organization: null as string | null, // [NOME DELL'ORGANIZZAZIONE E BREVE DESCRIZIONE]
  dataController: null as string | null, // [TITOLARE]
  emailRetention: null as string | null, // [PERIODO]
};

/** Colours of the initials, as in the design (all with contrast ≥ 4.5:1 on white). */
const FAVICON_COLORS = [
  "#1f3fbf",
  "#8a3b12",
  "#1b6b3a",
  "#6b2a7a",
  "#0f5e6e",
  "#9b1c4a",
  "#4a4f5a",
  "#7a5a00",
] as const;

export function faviconColor(key: string): string {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return FAVICON_COLORS[hash % FAVICON_COLORS.length]!;
}

export const PER_PAGE = 25;
export const REPORTS_PER_PAGE = 20;
