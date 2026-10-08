import { SEED_SERVICES } from "../prisma/seed-data";
import { slugify } from "../src/lib/normalize";
import { PER_PAGE, REPORTS_PER_PAGE } from "../src/lib/site";

/** Aspettative dei test ricavate dai dati del seed locale. */
const byCount = [...SEED_SERVICES].sort((a, b) => b.count - a.count);

export const TOTAL = SEED_SERVICES.length;
export const PAGES = Math.ceil(TOTAL / PER_PAGE);
export const LAST_PAGE_ROWS = TOTAL - (PAGES - 1) * PER_PAGE;

const withSlug = (s: (typeof SEED_SERVICES)[number]) => ({
  ...s,
  slug: slugify(s.name),
});

/** Il servizio più segnalato (conteggio unico) e il secondo. */
export const TOP = withSlug(byCount[0]!);
export const SECOND = withSlug(byCount[1]!);
if (TOP.count === SECOND.count)
  throw new Error("Il seed deve avere un primo servizio unico.");
export const TOP_REPORT_PAGES = Math.ceil(TOP.count / REPORTS_PER_PAGE);

/** Un servizio con una sola segnalazione. */
export const SINGLE = withSlug(SEED_SERVICES.find((s) => s.count === 1)!);

/** Una ricerca con un solo risultato. */
export const UNIQUE_QUERY = "satispay";
export const UNIQUE_RESULT = withSlug(
  SEED_SERVICES.find((s) => /satispay/i.test(s.name))!,
);

/** Un servizio il cui nome contiene punti, per la ricerca senza separatori. */
export const DOTTED = withSlug(
  SEED_SERVICES.find((s) => s.name === "comune.milano.it")!,
);

export const KIND_LABEL = {
  WEBSITE: "Sito web",
  APP: "App",
  DOCUMENT: "Documento PDF",
  OTHER: "Altro servizio digitale",
} as const;

export const received = (n: number) =>
  n === 1 ? "segnalazione ricevuta" : "segnalazioni ricevute";
