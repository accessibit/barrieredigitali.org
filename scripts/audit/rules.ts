/**
 * Plain-Italian report text for each audit rule, written from the point of
 * view of the people affected. Only rules listed here become reports: any
 * other finding is skipped, so nothing generic or unverified is published.
 *
 * `where` is "nella home page" or "nella pagina «Titolo»"; `n` is the number
 * of affected elements on that page.
 */
export type RuleText = {
  /** WCAG 2.2 success criteria, for the internal evidence. */
  wcag: string[];
  text: (where: string, n: number) => string;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const many = (n: number, one: string, more: string) =>
  n === 1 ? one : `${n} ${more}`;

export const RULE_TEXT: Record<string, RuleText> = {
  "image-alt": {
    wcag: ["1.1.1"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un’immagine non ha", "immagini non hanno")} una descrizione: chi usa un lettore di schermo non sa cosa mostra${n === 1 ? "" : "no"}.`,
  },
  "role-img-alt": {
    wcag: ["1.1.1"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un’icona o un’immagine non ha", "icone o immagini non hanno")} un nome: il lettore di schermo non dice cosa rappresenta${n === 1 ? "" : "no"}.`,
  },
  "svg-img-alt": {
    wcag: ["1.1.1"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un’immagine vettoriale non ha", "immagini vettoriali non hanno")} un testo alternativo: per chi non vede rest${n === 1 ? "a muta" : "ano mute"}.`,
  },
  "input-image-alt": {
    wcag: ["1.1.1", "4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un pulsante fatto con un’immagine non ha", "pulsanti fatti con immagini non hanno")} un testo: il lettore di schermo non dice a cosa serv${n === 1 ? "e" : "ono"}.`,
  },
  "button-name": {
    wcag: ["4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un pulsante non ha", "pulsanti non hanno")} un nome: il lettore di schermo dice solo «pulsante», senza spiegare cosa ${n === 1 ? "fa" : "fanno"}.`,
  },
  "link-name": {
    wcag: ["2.4.4", "4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un link non ha", "link non hanno")} un testo leggibile: chi usa il lettore di schermo sente solo «link» e non sa dove porta${n === 1 ? "" : "no"}.`,
  },
  label: {
    wcag: ["1.3.1", "4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un campo da compilare non ha", "campi da compilare non hanno")} un’etichetta: il lettore di schermo dice solo «campo di modifica», senza spiegare cosa scrivere.`,
  },
  "select-name": {
    wcag: ["1.3.1", "4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un menu a tendina non ha", "menu a tendina non hanno")} un’etichetta: con il lettore di schermo non si capisce cosa scegliere.`,
  },
  "aria-input-field-name": {
    wcag: ["4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un campo interattivo non ha", "campi interattivi non hanno")} un nome: il lettore di schermo non dice a cosa serv${n === 1 ? "e" : "ono"}.`,
  },
  "aria-command-name": {
    wcag: ["4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un comando non ha", "comandi non hanno")} un nome: con il lettore di schermo non si capisce cosa succede attivandol${n === 1 ? "o" : "i"}.`,
  },
  "aria-toggle-field-name": {
    wcag: ["4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un interruttore o una casella di scelta non ha", "interruttori o caselle di scelta non hanno")} un nome: non si capisce cosa si sta attivando.`,
  },
  "color-contrast": {
    wcag: ["1.4.3"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un testo ha", "testi hanno")} un colore troppo simile allo sfondo: per chi vede poco ${n === 1 ? "è" : "sono"} difficil${n === 1 ? "e" : "i"} da leggere.`,
  },
  "link-in-text-block": {
    wcag: ["1.4.1"],
    text: (w) =>
      `${capitalize(w)} alcuni link nel testo si distinguono solo per il colore, senza sottolineatura: chi non distingue bene i colori non li riconosce.`,
  },
  "html-has-lang": {
    wcag: ["3.1.1"],
    text: (w) =>
      `${capitalize(w)} non è indicata la lingua: il lettore di schermo può leggere l’italiano con la pronuncia sbagliata.`,
  },
  "html-lang-valid": {
    wcag: ["3.1.1"],
    text: (w) =>
      `${capitalize(w)} la lingua è indicata in modo errato: il lettore di schermo può leggere il testo con la pronuncia sbagliata.`,
  },
  "document-title": {
    wcag: ["2.4.2"],
    text: (w) =>
      `${capitalize(w)} manca il titolo della pagina: chi usa il lettore di schermo non sa dove si trova.`,
  },
  "frame-title": {
    wcag: ["4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un contenuto incorporato (ad esempio una mappa o un video) non ha", "contenuti incorporati (ad esempio mappe o video) non hanno")} un titolo: con il lettore di schermo non si capisce cosa ${n === 1 ? "contiene" : "contengono"}.`,
  },
  "meta-viewport": {
    wcag: ["1.4.4"],
    text: (w) =>
      `${capitalize(w)} lo zoom è bloccato sul telefono: chi ha bisogno di ingrandire il testo non può farlo.`,
  },
  "nested-interactive": {
    wcag: ["4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un elemento cliccabile ne contiene un altro", "elementi cliccabili ne contengono altri")}: con la tastiera e il lettore di schermo alcuni non si raggiungono.`,
  },
  "scrollable-region-focusable": {
    wcag: ["2.1.1"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un’area che scorre non si può", "aree che scorrono non si possono")} far scorrere con la tastiera: chi non usa il mouse non vede tutto il contenuto.`,
  },
  "aria-hidden-focus": {
    wcag: ["4.1.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un elemento nascosto al lettore di schermo si può", "elementi nascosti al lettore di schermo si possono")} comunque raggiungere con il tasto Tab: il focus finisce su qualcosa che non viene letto.`,
  },
  "aria-required-children": {
    wcag: ["1.3.1"],
    text: (w) =>
      `${capitalize(w)} un menu o un elenco interattivo è costruito in modo incompleto: il lettore di schermo non riesce a presentarne le voci correttamente.`,
  },
  "aria-required-parent": {
    wcag: ["1.3.1"],
    text: (w) =>
      `${capitalize(w)} alcune voci di menu o di elenco sono fuori dal loro contenitore: il lettore di schermo le annuncia in modo confuso.`,
  },
  list: {
    wcag: ["1.3.1"],
    text: (w) =>
      `${capitalize(w)} alcuni elenchi sono costruiti in modo errato: il lettore di schermo non dice quante voci contengono.`,
  },
  listitem: {
    wcag: ["1.3.1"],
    text: (w) =>
      `${capitalize(w)} alcune voci di elenco sono fuori da un elenco: il lettore di schermo non le presenta come tali.`,
  },
  "target-size": {
    wcag: ["2.5.8"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un pulsante o link è", "pulsanti o link sono")} troppo piccol${n === 1 ? "o" : "i"} o troppo vicin${n === 1 ? "o" : "i"} ad altri: per chi ha difficoltà nei movimenti è facile toccare quello sbagliato.`,
  },
  "autocomplete-valid": {
    wcag: ["1.3.5"],
    text: (w) =>
      `${capitalize(w)} alcuni campi dei dati personali non permettono al browser di compilarli in automatico in modo corretto: chi ha difficoltà a scrivere deve inserire tutto a mano.`,
  },
  "video-caption": {
    wcag: ["1.2.2"],
    text: (w, n) =>
      `${capitalize(w)} ${many(n, "un video non ha", "video non hanno")} sottotitoli: chi non sente non può seguirl${n === 1 ? "o" : "i"}.`,
  },
  "td-headers-attr": {
    wcag: ["1.3.1"],
    text: (w) =>
      `${capitalize(w)} una tabella collega i dati alle intestazioni sbagliate: con il lettore di schermo non si capisce a cosa si riferiscono i numeri.`,
  },
  "th-has-data-cells": {
    wcag: ["1.3.1"],
    text: (w) =>
      `${capitalize(w)} una tabella ha intestazioni non collegate ai dati: con il lettore di schermo i valori si leggono senza contesto.`,
  },
  // Custom check (not axe): page reflow at 320 CSS px, i.e. 400% zoom.
  reflow: {
    wcag: ["1.4.10"],
    text: (w) =>
      `${capitalize(w)}, con lo zoom al 400% (o su uno schermo stretto), la pagina scorre in orizzontale: per leggere ogni riga bisogna spostarsi avanti e indietro.`,
  },
};
