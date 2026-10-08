/**
 * Normalizza il nome o l'indirizzo di un servizio per la ricerca:
 * minuscolo, senza protocollo, senza "www." e senza percorso.
 */
export function normalizeName(value: string | null | undefined): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

/** Crea uno slug leggibile per l'URL della pagina di dettaglio. */
export function slugify(value: string): string {
  return (
    normalizeName(value)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "servizio"
  );
}
