/**
 * Normalizes the name or address of a service for search:
 * lowercase, without protocol, without "www." and without path.
 */
export function normalizeName(value: string | null | undefined): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

/** Creates a readable slug for the detail page URL. */
export function slugify(value: string): string {
  return (
    normalizeName(value)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "servizio"
  );
}
