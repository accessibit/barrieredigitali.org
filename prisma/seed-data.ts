/**
 * Demo data for local development: real public services with sample
 * reports. Shared with the end-to-end tests, which derive their
 * expectations from it (first service, totals, pages).
 */
import type { ServiceType } from "../src/generated/prisma/enums";

export type SeedService = { name: string; type: ServiceType; count: number };
export type SeedReport = { daysAgo: number; text: string };

export const SEED_SERVICES: SeedService[] = [
  // Public administration
  { name: "inps.it", type: "WEBSITE", count: 48 },
  { name: "agenziaentrate.gov.it", type: "WEBSITE", count: 41 },
  { name: "App IO", type: "APP", count: 36 },
  { name: "comune.roma.it", type: "WEBSITE", count: 29 },
  { name: "comune.milano.it", type: "WEBSITE", count: 24 },
  { name: "comune.napoli.it", type: "WEBSITE", count: 19 },
  { name: "comune.torino.it", type: "WEBSITE", count: 15 },
  { name: "comune.bologna.it", type: "WEBSITE", count: 9 },
  { name: "comune.firenze.it", type: "WEBSITE", count: 11 },
  { name: "comune.palermo.it", type: "WEBSITE", count: 13 },
  { name: "anagrafenazionale.interno.it", type: "WEBSITE", count: 12 },
  { name: "cartaidentita.interno.it", type: "WEBSITE", count: 17 },
  { name: "passaportonline.poliziadistato.it", type: "WEBSITE", count: 22 },
  { name: "ilportaledellautomobilista.it", type: "WEBSITE", count: 14 },
  { name: "salute.gov.it", type: "WEBSITE", count: 6 },
  { name: "istruzione.it", type: "WEBSITE", count: 10 },
  { name: "regione.lombardia.it", type: "WEBSITE", count: 7 },
  { name: "regione.lazio.it", type: "WEBSITE", count: 8 },
  { name: "pagopa.gov.it", type: "WEBSITE", count: 5 },
  { name: "Modello 730 precompilato", type: "DOCUMENT", count: 16 },
  { name: "Modello F24", type: "DOCUMENT", count: 9 },
  { name: "Attestazione ISEE", type: "DOCUMENT", count: 7 },
  { name: "Certificato di residenza", type: "DOCUMENT", count: 3 },

  // Transport
  { name: "trenitalia.com", type: "WEBSITE", count: 33 },
  { name: "App Trenitalia", type: "APP", count: 21 },
  { name: "italotreno.com", type: "WEBSITE", count: 18 },
  { name: "atm.it", type: "WEBSITE", count: 12 },
  { name: "atac.roma.it", type: "WEBSITE", count: 14 },
  { name: "gtt.to.it", type: "WEBSITE", count: 4 },
  { name: "autostrade.it", type: "WEBSITE", count: 6 },
  { name: "ita-airways.com", type: "WEBSITE", count: 11 },
  { name: "ryanair.com", type: "WEBSITE", count: 20 },
  { name: "App Telepass", type: "APP", count: 5 },
  { name: "Biglietteria self-service Trenitalia", type: "OTHER", count: 13 },
  { name: "Emettitrice di biglietti ATM", type: "OTHER", count: 4 },

  // Banks and payments
  { name: "poste.it", type: "WEBSITE", count: 27 },
  { name: "App BancoPosta", type: "APP", count: 23 },
  { name: "App Postepay", type: "APP", count: 15 },
  { name: "intesasanpaolo.com", type: "WEBSITE", count: 12 },
  { name: "App Intesa Sanpaolo Mobile", type: "APP", count: 10 },
  { name: "unicredit.it", type: "WEBSITE", count: 9 },
  { name: "App Satispay", type: "APP", count: 2 },
  { name: "Sportello Bancomat", type: "OTHER", count: 8 },

  // Energy and telecoms
  { name: "enel.it", type: "WEBSITE", count: 16 },
  { name: "Bolletta Enel Energia", type: "DOCUMENT", count: 6 },
  { name: "a2a.it", type: "WEBSITE", count: 5 },
  { name: "hera.it", type: "WEBSITE", count: 3 },
  { name: "tim.it", type: "WEBSITE", count: 13 },
  { name: "vodafone.it", type: "WEBSITE", count: 11 },
  { name: "windtre.it", type: "WEBSITE", count: 8 },
  { name: "iliad.it", type: "WEBSITE", count: 2 },
  { name: "fastweb.it", type: "WEBSITE", count: 4 },

  // Retail and services
  { name: "amazon.it", type: "WEBSITE", count: 19 },
  { name: "ebay.it", type: "WEBSITE", count: 6 },
  { name: "zalando.it", type: "WEBSITE", count: 9 },
  { name: "esselunga.it", type: "WEBSITE", count: 7 },
  { name: "conad.it", type: "WEBSITE", count: 3 },
  { name: "ikea.com", type: "WEBSITE", count: 5 },
  { name: "mediaworld.it", type: "WEBSITE", count: 8 },
  { name: "unieuro.it", type: "WEBSITE", count: 4 },
  { name: "booking.com", type: "WEBSITE", count: 10 },
  { name: "App Glovo", type: "APP", count: 6 },
  { name: "App Deliveroo", type: "APP", count: 4 },
  { name: "App Just Eat", type: "APP", count: 3 },

  // News and media
  { name: "raiplay.it", type: "WEBSITE", count: 12 },
  { name: "repubblica.it", type: "WEBSITE", count: 7 },
  { name: "corriere.it", type: "WEBSITE", count: 6 },
  { name: "ansa.it", type: "WEBSITE", count: 1 },

  // Health
  { name: "App Salutile Prenotazioni", type: "APP", count: 9 },
  {
    name: "Fascicolo sanitario elettronico Lombardia",
    type: "WEBSITE",
    count: 14,
  },
  { name: "Totem di accettazione ospedaliera", type: "OTHER", count: 1 },
];

/** Sample texts per service type. */
const ISSUES: Record<ServiceType, string[]> = {
  WEBSITE: [
    "Il pulsante per proseguire non si raggiunge con la tastiera.",
    "Le immagini non hanno una descrizione: il lettore di schermo non dice cosa mostrano.",
    "I campi del modulo non hanno un nome leggibile dal lettore di schermo.",
    "Con il testo ingrandito al 200% i contenuti si sovrappongono e non si leggono.",
    "Il testo grigio chiaro su sfondo bianco è quasi illeggibile.",
    "I video non hanno sottotitoli né trascrizione.",
    "La sessione scade troppo in fretta e perdo quello che ho scritto.",
    "Il messaggio di errore non spiega quale campo è sbagliato.",
    "La finestra dei cookie non si chiude senza mouse e blocca tutta la pagina.",
    "Il menu si apre solo passando sopra con il mouse.",
    "Il calendario per scegliere la data si usa solo con il mouse.",
    "Il codice di verifica scade prima che riesca a inserirlo con il lettore di schermo.",
  ],
  APP: [
    "L’app ignora la dimensione del testo impostata sul telefono.",
    "Molti pulsanti non hanno nome: VoiceOver legge solo «pulsante».",
    "Con TalkBack non riesco a completare l’operazione: il focus salta in fondo alla schermata.",
    "Il codice di conferma scade prima che riesca a inserirlo.",
    "Gli importi negativi si distinguono solo per il colore rosso.",
    "L’accesso funziona solo con il riconoscimento facciale, senza alternative.",
  ],
  DOCUMENT: [
    "Il PDF è una scansione: il lettore di schermo non legge nulla.",
    "Le tabelle del documento non hanno intestazioni: i numeri si leggono senza contesto.",
    "Il documento non ha titoli: non riesco a spostarmi tra le sezioni.",
    "I campi da compilare nel PDF non si raggiungono con la tastiera.",
  ],
  OTHER: [
    "Lo schermo è solo touch e non c’è una guida vocale.",
    "Il terminale è troppo alto per chi usa la sedia a rotelle.",
    "Le istruzioni sono solo scritte, molto piccole e con poco contrasto.",
    "Non c’è un’alternativa per chi non riesce a usare lo schermo: lo sportello è chiuso.",
  ],
};

function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

/** Deterministic reports for a service, most recent first. */
export function seedReports(service: SeedService, index: number): SeedReport[] {
  const rnd = lcg(1000 + index);
  const texts = ISSUES[service.type];
  const reports: SeedReport[] = [];
  let day = Math.floor(rnd() * 20);
  for (let i = 0; i < service.count; i++) {
    reports.push({
      daysAgo: day,
      text: texts[Math.floor(rnd() * texts.length)]!,
    });
    day += 1 + Math.floor(rnd() * 9);
  }
  return reports;
}
