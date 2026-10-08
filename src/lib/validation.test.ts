import { describe, expect, it } from "vitest";

import { validateReport } from "@/lib/validation";

describe("validateReport", () => {
  it("accetta una segnalazione completa senza email", () => {
    const { data, errors } = validateReport({
      kind: "APP",
      site: " Banca Example ",
      desc: "Il codice SMS scade troppo in fretta.",
      email: "",
    });
    expect(errors).toBeNull();
    expect(data).toMatchObject({
      kind: "APP",
      site: "Banca Example",
      email: "",
    });
  });

  it("restituisce i messaggi del design", () => {
    const { errors } = validateReport({
      site: "",
      desc: "corta",
      email: "mario.rossi@",
    });
    expect(errors).toEqual({
      site: "scrivi il nome o l’indirizzo di ciò che vuoi segnalare.",
      desc: "aggiungi qualche dettaglio: cosa stavi cercando di fare?",
      email:
        "l’email non sembra completa, ad esempio nome@esempio.it. Puoi anche lasciare il campo vuoto.",
    });
  });

  it("chiede la descrizione se è vuota", () => {
    expect(validateReport({ site: "x", desc: "   " }).errors?.desc).toBe(
      "descrivi il problema che hai incontrato.",
    );
  });

  it("ripiega su Sito web per un tipo sconosciuto", () => {
    expect(
      validateReport({
        kind: "hack",
        site: "x",
        desc: "descrizione abbastanza lunga",
      }).data?.kind,
    ).toBe("WEBSITE");
  });
});
