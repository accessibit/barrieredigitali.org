/**
 * Contatti e dati dell'organizzazione. Finché non sono definiti restano
 * segnaposto, evidenziati nelle pagine come nel design.
 */
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

/** Colori delle iniziali, come nel design (tutti con contrasto ≥ 4.5:1 sul bianco). */
export const FAVICON_COLORS = [
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
