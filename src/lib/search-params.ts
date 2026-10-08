import type { SortOrder } from "@/lib/services";

type Raw = Record<string, string | string[] | undefined>;

/** Ultimo valore di un parametro: con i form GET il pulsante premuto arriva per ultimo. */
export function last(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.at(-1) ?? "";
  return value ?? "";
}

export const SORT_PARAM = {
  count: "piu-segnalati",
  recent: "recenti",
} as const;

export function parseListParams(raw: Raw) {
  const query = last(raw.q).slice(0, 200);
  const sort: SortOrder =
    last(raw.ordina) === SORT_PARAM.recent ? "recent" : "count";
  const page = Math.max(1, Number.parseInt(last(raw.pagina), 10) || 1);
  const from = last(raw.da);
  return { query, sort, page, from };
}

/** Costruisce l'URL dell'elenco mantenendo solo i parametri non predefiniti. */
export function listHref({
  query = "",
  sort = "count",
  page = 1,
}: {
  query?: string;
  sort?: SortOrder;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (sort === "recent") params.set("ordina", SORT_PARAM.recent);
  if (page > 1) params.set("pagina", String(page));
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

/** Numeri di pagina da mostrare: prima, precedente, attuale, successiva, ultima. */
export function pageWindow(page: number, pages: number): Array<number | "gap"> {
  const nums = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  nums.forEach((n, i) => {
    const prev = nums[i - 1];
    if (prev !== undefined && n - prev > 1) out.push("gap");
    out.push(n);
  });
  return out;
}
