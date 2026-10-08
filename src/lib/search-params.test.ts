import { describe, expect, it } from "vitest";

import { listHref, pageWindow, parseListParams } from "@/lib/search-params";

describe("pageWindow", () => {
  it("mostra prima, vicine e ultima pagina con i salti", () => {
    expect(pageWindow(1, 17)).toEqual([1, 2, "gap", 17]);
    expect(pageWindow(9, 17)).toEqual([1, "gap", 8, 9, 10, "gap", 17]);
    expect(pageWindow(17, 17)).toEqual([1, "gap", 16, 17]);
    expect(pageWindow(2, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(1, 1)).toEqual([1]);
  });
});

describe("parseListParams", () => {
  it("usa valori predefiniti sicuri", () => {
    expect(parseListParams({})).toEqual({
      query: "",
      sort: "count",
      page: 1,
      from: "",
    });
    expect(parseListParams({ pagina: "-4", ordina: "boh" })).toMatchObject({
      page: 1,
      sort: "count",
    });
  });

  it("con parametri ripetuti vince l'ultimo (il pulsante premuto)", () => {
    expect(parseListParams({ ordina: ["piu-segnalati", "recenti"] }).sort).toBe(
      "recent",
    );
  });
});

describe("listHref", () => {
  it("omette i parametri predefiniti", () => {
    expect(listHref({})).toBe("/");
    expect(listHref({ query: " banca ", sort: "recent", page: 3 })).toBe(
      "/?q=banca&ordina=recenti&pagina=3",
    );
  });
});
