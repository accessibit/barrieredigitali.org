import { describe, expect, it } from "vitest";

import { normalizeName, slugify } from "@/lib/normalize";

describe("normalizeName", () => {
  it("toglie protocollo, www e percorso", () => {
    expect(normalizeName("https://www.Negozio.example/carrello?x=1")).toBe(
      "negozio.example",
    );
    expect(normalizeName("  Banca Example ")).toBe("banca example");
    expect(normalizeName(undefined)).toBe("");
  });
});

describe("slugify", () => {
  it("crea slug leggibili", () => {
    expect(slugify("Prenota Salute Example")).toBe("prenota-salute-example");
    expect(slugify("negozio.example")).toBe("negozio-example");
    expect(slugify("Università è")).toBe("universita-e");
    expect(slugify("!!!")).toBe("servizio");
  });
});
