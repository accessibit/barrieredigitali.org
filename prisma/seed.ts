/**
 * Local demo data, ported from the design's mock (deterministic generator).
 *
 * It refuses to run against anything other than a local database: production
 * deploys only ever run `prisma migrate deploy`.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import type { ServiceKind } from "../src/generated/prisma/enums";
import { normalizeName, slugify } from "../src/lib/normalize";

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

type SeedReport = { daysAgo: number; text: string };
type SeedService = {
  name: string;
  kind: ServiceKind;
  count: number;
  reports: SeedReport[];
};

const ISSUES = [
  "Il pulsante per proseguire non si raggiunge con la tastiera.",
  "Le immagini non hanno una descrizione: il lettore di schermo non dice cosa mostrano.",
  "I campi del modulo non hanno un nome leggibile dal lettore di schermo.",
  "Con il testo ingrandito i contenuti si sovrappongono e non si leggono.",
  "Il testo grigio chiaro su sfondo bianco è quasi illeggibile.",
  "I video non hanno sottotitoli.",
  "La sessione scade troppo in fretta e perdo quello che ho scritto.",
  "Il messaggio di errore non spiega quale campo è sbagliato.",
  "La finestra dei cookie non si chiude senza mouse.",
  "Il menu si apre solo passando sopra con il mouse.",
  "Il documento in PDF è una scansione e il lettore di schermo non lo legge.",
  "Il codice di verifica scade prima che riesca a inserirlo.",
];

// Hand-written services from the design. Days are counted back from 7 Oct 2026, the design's reference date.
const FEATURED: SeedService[] = [
  {
    name: "negozio.example",
    kind: "WEBSITE",
    count: 47,
    reports: [
      {
        daysAgo: 5,
        text: "Arrivo al riepilogo dell’ordine, ma il pulsante «Paga ora» non si raggiunge con il tasto Tab. Non riesco a completare il pagamento usando la tastiera.",
      },
      {
        daysAgo: 8,
        text: "Le taglie sono solo quadratini colorati: il lettore di schermo dice «pulsante» e basta.",
      },
      {
        daysAgo: 13,
        text: "Con lo zoom al 200% il riquadro del carrello copre il pulsante per proseguire.",
      },
      {
        daysAgo: 19,
        text: "La finestra dei cookie non si chiude senza mouse e blocca tutta la pagina.",
      },
    ],
  },
  {
    name: "Banca Example",
    kind: "APP",
    count: 38,
    reports: [
      {
        daysAgo: 2,
        text: "Il codice SMS per confermare il bonifico scade dopo 30 secondi. Con il lettore di schermo non faccio in tempo a inserirlo.",
      },
      {
        daysAgo: 6,
        text: "L’app ignora la dimensione del testo impostata sul telefono: gli importi restano minuscoli.",
      },
      {
        daysAgo: 11,
        text: "Gli importi negativi sono solo in rosso chiaro: non li distinguo da quelli positivi.",
      },
      {
        daysAgo: 17,
        text: "I pulsanti della schermata «Carte» non hanno nome: VoiceOver legge solo «pulsante».",
      },
    ],
  },
  {
    name: "trasporti.example",
    kind: "WEBSITE",
    count: 29,
    reports: [
      {
        daysAgo: 1,
        text: "Gli orari delle linee sono pubblicati come immagine, senza testo. Non so a che ora passa l’autobus.",
      },
      {
        daysAgo: 4,
        text: "Nel modulo per l’abbonamento il calendario si usa solo con il mouse.",
      },
      {
        daysAgo: 10,
        text: "Gli avvisi di sciopero sono solo in video, senza sottotitoli né trascrizione.",
      },
    ],
  },
  {
    name: "comune.example",
    kind: "WEBSITE",
    count: 21,
    reports: [
      {
        daysAgo: 9,
        text: "Con il testo al 200% il pulsante «Avanti» esce dallo schermo e non posso inviare la richiesta di certificato.",
      },
      {
        daysAgo: 16,
        text: "I campi del modulo non hanno un nome: sento solo «campo di modifica», dieci volte di seguito.",
      },
      {
        daysAgo: 22,
        text: "La sessione scade dopo pochi minuti e perdo tutto quello che ho scritto.",
      },
    ],
  },
  {
    name: "Prenota Salute Example",
    kind: "APP",
    count: 17,
    reports: [
      {
        daysAgo: 4,
        text: "Scelgo l’ambulatorio, ma il calendario delle date disponibili non si usa con TalkBack. Non posso prenotare la visita da solo.",
      },
      {
        daysAgo: 15,
        text: "L’errore appare solo come bordo rosso, senza spiegare quale campo è sbagliato.",
      },
      {
        daysAgo: 25,
        text: "Le istruzioni per ritirare i referti sono scritte in modo troppo tecnico.",
      },
    ],
  },
  {
    name: "scuola.example",
    kind: "WEBSITE",
    count: 9,
    reports: [
      {
        daysAgo: 7,
        text: "Nel registro elettronico i pulsanti per giustificare le assenze non hanno nome: il lettore dice solo «pulsante».",
      },
      {
        daysAgo: 20,
        text: "Le scritte grigio chiaro su sfondo bianco sono quasi illeggibili.",
      },
    ],
  },
  {
    name: "Bolletta Energia Example",
    kind: "DOCUMENT",
    count: 6,
    reports: [
      {
        daysAgo: 18,
        text: "La bolletta in PDF è una scansione: il lettore di schermo non legge nulla, nemmeno l’importo da pagare.",
      },
      {
        daysAgo: 29,
        text: "Le tabelle dei consumi nel PDF non hanno intestazioni: i numeri si leggono senza sapere a cosa si riferiscono.",
      },
    ],
  },
];

const TOTAL_SERVICES = 423;

function generate(): SeedService[] {
  let seed = 423;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const pick = <T>(list: readonly T[]) =>
    list[Math.floor(rnd() * list.length)]!;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const cats = [
    "comune",
    "scuola",
    "biblioteca",
    "museo",
    "ospedale",
    "universita",
    "teatro",
    "libreria",
    "ottica",
    "farmacia",
    "assicurazioni",
    "energia",
    "acqua",
    "telefonia",
    "viaggi",
    "hotel",
    "palestra",
    "cinema",
    "autonoleggio",
    "parcheggi",
    "spedizioni",
    "mercato",
    "condominio",
    "lavoro",
    "tasse",
    "rifiuti",
    "sport",
    "turismo",
  ];
  const cities = [
    "torino",
    "milano",
    "genova",
    "bologna",
    "firenze",
    "roma",
    "napoli",
    "bari",
    "palermo",
    "cagliari",
    "verona",
    "padova",
    "trieste",
    "perugia",
    "ancona",
    "pescara",
    "lecce",
    "catania",
    "trento",
    "brescia",
    "parma",
    "modena",
    "pisa",
    "siena",
    "como",
    "bergamo",
    "salerno",
    "messina",
    "udine",
    "aosta",
  ];

  const out: SeedService[] = [...FEATURED];
  const used = new Set<string>();
  for (let k = 0; out.length < TOTAL_SERVICES && k < 5000; k++) {
    const cat = pick(cats);
    const city = pick(cities);
    if (used.has(cat + city)) continue;
    used.add(cat + city);

    const r = rnd();
    const [name, kind]: [string, ServiceKind] =
      r < 0.72
        ? [`${cat}-${city}.example`, "WEBSITE"]
        : r < 0.92
          ? [`${cap(cat)} ${cap(city)} Example`, "APP"]
          : [`Modulo ${cat} ${cap(city)} Example`, "DOCUMENT"];
    const count = 1 + Math.floor(Math.pow(rnd(), 2.4) * 26);
    const ago = Math.floor(rnd() * 150);
    const reports: SeedReport[] = [];
    for (let j = 0; j < Math.min(count, 3); j++) {
      reports.push({
        daysAgo: ago + j * (3 + Math.floor(rnd() * 12)),
        text: pick(ISSUES),
      });
    }
    out.push({ name, kind, count, reports });
  }
  return out;
}

/** Fills each service up to `count` reports, going further back in time. */
function expand(service: SeedService, rnd: () => number): SeedReport[] {
  const reports = [...service.reports];
  let day = reports.at(-1)?.daysAgo ?? 0;
  while (reports.length < service.count) {
    day += 2 + Math.floor(rnd() * 9);
    reports.push({
      daysAgo: day,
      text: ISSUES[Math.floor(rnd() * ISSUES.length)]!,
    });
  }
  return reports;
}

async function main() {
  const url = assertLocalDatabase(process.env.DATABASE_URL);
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });

  let seed = 7;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
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

    const services = generate();
    const slugs = new Set<string>();
    let reportCount = 0;

    for (const service of services) {
      let slug = slugify(service.name);
      while (slugs.has(slug)) slug = `${slug}-2`;
      slugs.add(slug);

      const reports = expand(service, rnd);
      reportCount += reports.length;
      await db.service.create({
        data: {
          slug,
          name: service.name,
          nameNormalized: normalizeName(service.name),
          kind: service.kind,
          reports: {
            createMany: {
              data: reports.map((r) => ({
                submittedKind: service.kind,
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

    // A couple of reports awaiting moderation, to try out the flow in Prisma Studio.
    await db.report.createMany({
      data: [
        {
          submittedKind: "WEBSITE",
          submittedName: "farmacia.example",
          description:
            "Il carrello non si apre con la tastiera e non riesco a ordinare.",
          status: "PENDING",
        },
        {
          submittedKind: "APP",
          submittedName: "Treni Example",
          description:
            "Il QR del biglietto non ha un'alternativa testuale per il lettore di schermo.",
          status: "PENDING",
        },
      ],
    });

    console.log(
      `Seed completato: ${services.length} servizi, ${reportCount} segnalazioni pubblicate.`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
