/**
 * Dati dimostrativi per lo sviluppo locale: servizi pubblici reali con
 * segnalazioni di esempio. Condivisi con i test end-to-end, che ne ricavano
 * le aspettative (primo servizio, totali, pagine).
 */
import type { ServiceKind } from "../src/generated/prisma/enums";

export type SeedService = { name: string; kind: ServiceKind; count: number };
export type SeedReport = { daysAgo: number; text: string };

export const SEED_SERVICES: SeedService[] = [
  // Pubblica amministrazione
  { name: "inps.it", kind: "WEBSITE", count: 48 },
  { name: "agenziaentrate.gov.it", kind: "WEBSITE", count: 41 },
  { name: "App IO", kind: "APP", count: 36 },
  { name: "comune.roma.it", kind: "WEBSITE", count: 29 },
  { name: "comune.milano.it", kind: "WEBSITE", count: 24 },
  { name: "comune.napoli.it", kind: "WEBSITE", count: 19 },
  { name: "comune.torino.it", kind: "WEBSITE", count: 15 },
  { name: "comune.bologna.it", kind: "WEBSITE", count: 9 },
  { name: "comune.firenze.it", kind: "WEBSITE", count: 11 },
  { name: "comune.palermo.it", kind: "WEBSITE", count: 13 },
  { name: "anagrafenazionale.interno.it", kind: "WEBSITE", count: 12 },
  { name: "cartaidentita.interno.it", kind: "WEBSITE", count: 17 },
  { name: "passaportonline.poliziadistato.it", kind: "WEBSITE", count: 22 },
  { name: "ilportaledellautomobilista.it", kind: "WEBSITE", count: 14 },
  { name: "salute.gov.it", kind: "WEBSITE", count: 6 },
  { name: "istruzione.it", kind: "WEBSITE", count: 10 },
  { name: "regione.lombardia.it", kind: "WEBSITE", count: 7 },
  { name: "regione.lazio.it", kind: "WEBSITE", count: 8 },
  { name: "pagopa.gov.it", kind: "WEBSITE", count: 5 },
  { name: "Modello 730 precompilato", kind: "DOCUMENT", count: 16 },
  { name: "Modello F24", kind: "DOCUMENT", count: 9 },
  { name: "Attestazione ISEE", kind: "DOCUMENT", count: 7 },
  { name: "Certificato di residenza", kind: "DOCUMENT", count: 3 },

  // Trasporti
  { name: "trenitalia.com", kind: "WEBSITE", count: 33 },
  { name: "App Trenitalia", kind: "APP", count: 21 },
  { name: "italotreno.com", kind: "WEBSITE", count: 18 },
  { name: "atm.it", kind: "WEBSITE", count: 12 },
  { name: "atac.roma.it", kind: "WEBSITE", count: 14 },
  { name: "gtt.to.it", kind: "WEBSITE", count: 4 },
  { name: "autostrade.it", kind: "WEBSITE", count: 6 },
  { name: "ita-airways.com", kind: "WEBSITE", count: 11 },
  { name: "ryanair.com", kind: "WEBSITE", count: 20 },
  { name: "App Telepass", kind: "APP", count: 5 },
  { name: "Biglietteria self-service Trenitalia", kind: "OTHER", count: 13 },
  { name: "Emettitrice di biglietti ATM", kind: "OTHER", count: 4 },

  // Banche e pagamenti
  { name: "poste.it", kind: "WEBSITE", count: 27 },
  { name: "App BancoPosta", kind: "APP", count: 23 },
  { name: "App Postepay", kind: "APP", count: 15 },
  { name: "intesasanpaolo.com", kind: "WEBSITE", count: 12 },
  { name: "App Intesa Sanpaolo Mobile", kind: "APP", count: 10 },
  { name: "unicredit.it", kind: "WEBSITE", count: 9 },
  { name: "App Satispay", kind: "APP", count: 2 },
  { name: "Sportello Bancomat", kind: "OTHER", count: 8 },

  // Energia e telefonia
  { name: "enel.it", kind: "WEBSITE", count: 16 },
  { name: "Bolletta Enel Energia", kind: "DOCUMENT", count: 6 },
  { name: "a2a.it", kind: "WEBSITE", count: 5 },
  { name: "hera.it", kind: "WEBSITE", count: 3 },
  { name: "tim.it", kind: "WEBSITE", count: 13 },
  { name: "vodafone.it", kind: "WEBSITE", count: 11 },
  { name: "windtre.it", kind: "WEBSITE", count: 8 },
  { name: "iliad.it", kind: "WEBSITE", count: 2 },
  { name: "fastweb.it", kind: "WEBSITE", count: 4 },

  // Commercio e servizi
  { name: "amazon.it", kind: "WEBSITE", count: 19 },
  { name: "ebay.it", kind: "WEBSITE", count: 6 },
  { name: "zalando.it", kind: "WEBSITE", count: 9 },
  { name: "esselunga.it", kind: "WEBSITE", count: 7 },
  { name: "conad.it", kind: "WEBSITE", count: 3 },
  { name: "ikea.com", kind: "WEBSITE", count: 5 },
  { name: "mediaworld.it", kind: "WEBSITE", count: 8 },
  { name: "unieuro.it", kind: "WEBSITE", count: 4 },
  { name: "booking.com", kind: "WEBSITE", count: 10 },
  { name: "App Glovo", kind: "APP", count: 6 },
  { name: "App Deliveroo", kind: "APP", count: 4 },
  { name: "App Just Eat", kind: "APP", count: 3 },

  // Informazione
  { name: "raiplay.it", kind: "WEBSITE", count: 12 },
  { name: "repubblica.it", kind: "WEBSITE", count: 7 },
  { name: "corriere.it", kind: "WEBSITE", count: 6 },
  { name: "ansa.it", kind: "WEBSITE", count: 1 },

  // Salute
  { name: "App Salutile Prenotazioni", kind: "APP", count: 9 },
  {
    name: "Fascicolo sanitario elettronico Lombardia",
    kind: "WEBSITE",
    count: 14,
  },
  { name: "Totem di accettazione ospedaliera", kind: "OTHER", count: 1 },
];

/** Testi di esempio per tipo di servizio. */
const ISSUES: Record<ServiceKind, string[]> = {
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

/** Segnalazioni deterministiche di un servizio, dalla più recente. */
export function seedReports(service: SeedService, index: number): SeedReport[] {
  const rnd = lcg(1000 + index);
  const texts = ISSUES[service.kind];
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
