import { expect, type Page, test } from "@playwright/test";

import { expectNoViolations, findReport, uniqueName } from "./helpers";

const site = (page: Page) =>
  page.getByRole("textbox", { name: /Nome o indirizzo/ });
const desc = (page: Page) =>
  page.getByRole("textbox", { name: /Descrivi il problema/ });
const email = (page: Page) =>
  page.getByRole("textbox", { name: /Email per eventuali aggiornamenti/ });
const submit = (page: Page) =>
  page.getByRole("button", { name: "Invia segnalazione" });
const summary = (page: Page) => page.locator("#riepilogo-errori");

test.describe("Modulo di segnalazione", () => {
  test("campi, etichette e suggerimenti", async ({ page }) => {
    await page.goto("/segnala");
    await expect(page).toHaveTitle(
      "Invia una segnalazione — Barriere Digitali",
    );
    await expect(page.getByRole("radio", { name: "Sito web" })).toBeChecked();
    await expect(site(page)).toHaveAccessibleDescription(
      "Ad esempio comune.milano.it o l’indirizzo della pagina.",
    );
    await expect(desc(page)).toHaveAccessibleDescription(
      "Cosa stavi cercando di fare e cosa te lo ha impedito? Non inserire dati personali.",
    );
    await expect(email(page)).toHaveAttribute("autocomplete", "email");
    await expect(site(page)).toHaveAttribute("aria-required", "true");
    await expect(
      page.getByRole("group", { name: /Cosa vuoi segnalare/ }),
    ).toBeVisible();
  });

  test("ogni tipo cambia il suggerimento del campo nome", async ({ page }) => {
    await page.goto("/segnala");
    const HINTS = [
      ["App", "Il nome dell’app, e se lo sai il sistema (iPhone o Android)."],
      ["Documento o PDF", "Il nome del documento e chi lo ha pubblicato."],
      [
        "Altro servizio digitale",
        "Il nome del servizio, ad esempio un totem o uno sportello digitale.",
      ],
      ["Sito web", "Ad esempio comune.milano.it o l’indirizzo della pagina."],
    ] as const;
    for (const [label, hint] of HINTS) {
      await page.getByRole("radio", { name: label }).check();
      await expect(page.getByRole("radio", { name: label })).toBeChecked();
      await expect(site(page)).toHaveAccessibleDescription(hint);
    }
  });

  test("i tipi si scelgono anche con le frecce", async ({ page }) => {
    await page.goto("/segnala");
    await page.getByRole("radio", { name: "Sito web" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "App" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "App" })).toBeFocused();
  });

  test("modulo vuoto: riepilogo con 2 errori, titolo e campi segnalati", async ({
    page,
  }) => {
    await page.goto("/segnala");
    await submit(page).click();
    await expect(summary(page)).toBeFocused();
    await expect(summary(page)).toContainText("Correggi 2 campi per inviare");
    await expect(page).toHaveTitle(
      "Errori nel modulo — Invia una segnalazione — Barriere Digitali",
    );
    await expect(site(page)).toHaveAttribute("aria-invalid", "true");
    await expect(desc(page)).toHaveAttribute("aria-invalid", "true");
    await expect(email(page)).toHaveAttribute("aria-invalid", "false");
    await expect(site(page)).toHaveAccessibleDescription(
      "Errore: scrivi il nome o l’indirizzo di ciò che vuoi segnalare. Ad esempio comune.milano.it o l’indirizzo della pagina.",
    );
  });

  test("i link del riepilogo portano a ciascun campo", async ({ page }) => {
    await page.goto("/segnala");
    await desc(page).fill("corta");
    await email(page).fill("mario.rossi@");
    await submit(page).click();
    await expect(summary(page)).toContainText("Correggi 3 campi per inviare");
    await summary(page)
      .getByRole("link", { name: /^Nome o indirizzo:/ })
      .click();
    await expect(site(page)).toBeFocused();
    await summary(page)
      .getByRole("link", {
        name: "Descrizione: aggiungi qualche dettaglio: cosa stavi cercando di fare?",
      })
      .click();
    await expect(desc(page)).toBeFocused();
    await summary(page)
      .getByRole("link", { name: /^Email: l’email non sembra completa/ })
      .click();
    await expect(email(page)).toBeFocused();
  });

  test("correggendo gli errori i valori restano e l'invio riesce", async ({
    page,
  }) => {
    const name = uniqueName("correzione");
    await page.goto("/segnala");
    await page.getByRole("radio", { name: "Documento o PDF" }).check();
    await desc(page).fill(
      "Il PDF della bolletta è una scansione e non si legge.",
    );
    await email(page).fill("non-valida");
    await submit(page).click();
    await expect(summary(page)).toContainText("Correggi 2 campi per inviare");
    await expect(
      page.getByRole("radio", { name: "Documento o PDF" }),
    ).toBeChecked();
    await expect(desc(page)).toHaveValue(
      "Il PDF della bolletta è una scansione e non si legge.",
    );
    await expect(email(page)).toHaveValue("non-valida");

    await site(page).fill(name);
    await email(page).fill("");
    await submit(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Grazie, l’abbiamo ricevuta.",
    );

    const saved = await findReport(name);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      submitted_kind: "DOCUMENT",
      description: "Il PDF della bolletta è una scansione e non si legge.",
      email: null,
      status: "PENDING",
      service_id: null,
    });
  });

  test("invio riuscito: conferma, riepilogo, email e salvataggio in attesa di verifica", async ({
    page,
  }) => {
    const name = uniqueName("completa");
    await page.goto("/segnala");
    await page.getByRole("radio", { name: "App" }).check();
    await site(page).fill(`  ${name}  `);
    await desc(page).fill(
      "Il calendario delle prenotazioni non si usa con TalkBack.",
    );
    await email(page).fill("persona@esempio.it");
    await submit(page).click();

    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText("Grazie, l’abbiamo ricevuta.");
    await expect(h1).toBeFocused();
    await expect(page).toHaveTitle("Segnalazione inviata — Barriere Digitali");
    await expect(
      page.getByText(
        "Ti scriveremo a persona@esempio.it quando sarà pubblicata.",
      ),
    ).toBeVisible();
    const recap = page.locator("dl");
    await expect(recap).toContainText("TipoApp");
    await expect(recap).toContainText(`Nome o indirizzo${name}`);
    await expect(recap).toContainText(
      "Il calendario delle prenotazioni non si usa con TalkBack.",
    );
    await expectNoViolations(page);

    const saved = await findReport(name);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      submitted_kind: "APP",
      submitted_name: name,
      email: "persona@esempio.it",
      status: "PENDING",
    });
  });

  test('"Invia un\'altra segnalazione" riparte da un modulo vuoto', async ({
    page,
  }) => {
    await page.goto(`/segnala?servizio=${uniqueName("altra")}`);
    await desc(page).fill("Descrizione sufficientemente lunga per l'invio.");
    await submit(page).click();
    await page
      .getByRole("link", { name: "Invia un’altra segnalazione" })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Invia una segnalazione",
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await expect(site(page)).toHaveValue("");
    await expect(desc(page)).toHaveValue("");
    await expect(page.getByRole("radio", { name: "Sito web" })).toBeChecked();
    await expect(page).toHaveTitle(
      "Invia una segnalazione — Barriere Digitali",
    );
  });

  test('"Torna alle segnalazioni" dalla conferma', async ({ page }) => {
    await page.goto(`/segnala?servizio=${uniqueName("torna")}`);
    await desc(page).fill("Descrizione sufficientemente lunga per l'invio.");
    await submit(page).click();
    await page.getByRole("link", { name: "Torna alle segnalazioni" }).click();
    await expect(page).toHaveURL("/");
  });

  test('"Annulla", "← Torna alle segnalazioni" e i link informativi', async ({
    page,
  }) => {
    await page.goto("/segnala");
    await page.getByRole("link", { name: "Annulla" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/segnala");
    await page.getByRole("link", { name: "← Torna alle segnalazioni" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/segnala");
    await page
      .getByRole("link", {
        name: "come trattiamo le segnalazioni",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL("/come-funziona");

    await page.goto("/segnala");
    await page.getByRole("link", { name: "informativa privacy" }).click();
    await expect(page).toHaveURL("/privacy");
  });

  test("il campo trappola per i bot non salva nulla ma non lo rivela", async ({
    page,
  }) => {
    const name = uniqueName("bot");
    await page.goto("/segnala");
    await site(page).fill(name);
    await desc(page).fill("Testo inviato da un bot che compila tutti i campi.");
    await page
      .locator("#website_url")
      .fill("http://spam.example", { force: true });
    await submit(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Grazie, l’abbiamo ricevuta.",
    );
    expect(await findReport(name)).toHaveLength(0);
  });

  test("il campo trappola è nascosto a tutti", async ({ page }) => {
    await page.goto("/segnala");
    await expect(page.locator("#website_url")).not.toBeInViewport();
    await expect(
      page.getByRole("textbox", { name: "Lascia vuoto questo campo" }),
    ).toHaveCount(0);
  });
});

test.describe("Modulo senza JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("errori, valori conservati, invio e conferma", async ({ page }) => {
    const name = uniqueName("nojs");
    await page.goto("/segnala");
    await page.getByRole("radio", { name: "App" }).check();
    await email(page).fill("non-valida");
    await submit(page).click();
    await expect(page).toHaveURL("/segnala");
    await expect(summary(page)).toContainText("Correggi 3 campi per inviare");
    await expect(page).toHaveTitle(
      "Errori nel modulo — Invia una segnalazione — Barriere Digitali",
    );
    await expect(page.getByRole("radio", { name: "App" })).toBeChecked();
    await expect(email(page)).toHaveValue("non-valida");
    await expect(site(page)).toHaveAttribute("aria-invalid", "true");

    await site(page).fill(name);
    await desc(page).fill("Funziona anche con JavaScript disattivato?");
    await email(page).fill("persona@esempio.it");
    await submit(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Grazie, l’abbiamo ricevuta.",
    );
    await expect(page).toHaveTitle("Segnalazione inviata — Barriere Digitali");
    await expect(page.locator("dl")).toContainText(`Nome o indirizzo${name}`);
    await expect(
      page.getByText(
        "Ti scriveremo a persona@esempio.it quando sarà pubblicata.",
      ),
    ).toBeVisible();
    const saved = await findReport(name);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      submitted_kind: "APP",
      status: "PENDING",
    });
  });
});
