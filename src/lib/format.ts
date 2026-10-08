const MONTHS = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
] as const;

/** "2026-10-02" o Date → "2 ott 2026" */
export function formatDate(value: Date | string): string {
  const iso = toIsoDate(value);
  const [year, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

/** Date → "2026-10-02" (UTC), da usare in <time dateTime>. */
export function toIsoDate(value: Date | string): string {
  return typeof value === "string"
    ? value.slice(0, 10)
    : value.toISOString().slice(0, 10);
}

/** Etichetta sotto il numero: "1 segnalazione ricevuta", "47 segnalazioni ricevute". */
export function receivedLabel(n: number): string {
  return n === 1 ? "segnalazione ricevuta" : "segnalazioni ricevute";
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? `1 ${one}` : `${n} ${many}`;
}
