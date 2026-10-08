/**
 * Italian websites audited by the editorial team: public services and large
 * companies that most people use and the press is likely to cover.
 * Only public pages are checked (no login): the home page plus up to two key
 * pages found in its navigation (see scan.ts).
 */
export type AuditTarget = {
  /** Name shown on the site; also used to match an existing service. */
  name: string;
  url: string;
};

export const AUDIT_TARGETS: AuditTarget[] = [
  // Central public administration
  { name: "inps.it", url: "https://www.inps.it/" },
  { name: "agenziaentrate.gov.it", url: "https://www.agenziaentrate.gov.it/" },
  { name: "inail.it", url: "https://www.inail.it/" },
  { name: "salute.gov.it", url: "https://www.salute.gov.it/" },
  { name: "mim.gov.it", url: "https://www.mim.gov.it/" },
  { name: "interno.gov.it", url: "https://www.interno.gov.it/" },
  { name: "governo.it", url: "https://www.governo.it/" },
  { name: "agid.gov.it", url: "https://www.agid.gov.it/" },
  { name: "pagopa.gov.it", url: "https://www.pagopa.gov.it/" },
  { name: "io.italia.it", url: "https://io.italia.it/" },
  {
    name: "cartaidentita.interno.it",
    url: "https://www.cartaidentita.interno.it/",
  },
  {
    name: "ilportaledellautomobilista.it",
    url: "https://www.ilportaledellautomobilista.it/",
  },
  { name: "aci.it", url: "https://www.aci.it/" },

  // Regions and large cities
  { name: "regione.lombardia.it", url: "https://www.regione.lombardia.it/" },
  { name: "regione.lazio.it", url: "https://www.regione.lazio.it/" },
  { name: "comune.roma.it", url: "https://www.comune.roma.it/" },
  { name: "comune.milano.it", url: "https://www.comune.milano.it/" },
  { name: "comune.napoli.it", url: "https://www.comune.napoli.it/" },
  { name: "comune.torino.it", url: "https://www.comune.torino.it/" },
  { name: "comune.bologna.it", url: "https://www.comune.bologna.it/" },
  { name: "comune.firenze.it", url: "https://www.comune.firenze.it/" },
  { name: "comune.palermo.it", url: "https://www.comune.palermo.it/" },

  // Transport
  { name: "trenitalia.com", url: "https://www.trenitalia.com/" },
  { name: "italotreno.com", url: "https://www.italotreno.com/" },
  { name: "atm.it", url: "https://www.atm.it/" },
  { name: "romamobilita.it", url: "https://romamobilita.it/" },
  { name: "ita-airways.com", url: "https://www.ita-airways.com/" },
  { name: "autostrade.it", url: "https://www.autostrade.it/" },

  // Banks, payments, energy, telecoms
  { name: "poste.it", url: "https://www.poste.it/" },
  { name: "intesasanpaolo.com", url: "https://www.intesasanpaolo.com/" },
  { name: "unicredit.it", url: "https://www.unicredit.it/" },
  { name: "enel.it", url: "https://www.enel.it/" },
  { name: "tim.it", url: "https://www.tim.it/" },
  { name: "vodafone.it", url: "https://www.vodafone.it/" },
  { name: "windtre.it", url: "https://www.windtre.it/" },

  // Shopping and media
  { name: "amazon.it", url: "https://www.amazon.it/" },
  { name: "esselunga.it", url: "https://www.esselunga.it/" },
  { name: "raiplay.it", url: "https://www.raiplay.it/" },
  { name: "repubblica.it", url: "https://www.repubblica.it/" },
  { name: "corriere.it", url: "https://www.corriere.it/" },
];
