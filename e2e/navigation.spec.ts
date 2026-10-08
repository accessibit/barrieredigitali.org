import { expect, test } from "@playwright/test";

import { footerNav, header, mainNav, settled } from "./helpers";

test.describe("Header", () => {
  test("il logo riporta all'elenco", async ({ page }) => {
    await page.goto("/chi-siamo");
    await header(page).getByRole("link", { name: "Barriere Digitali" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Le barriere del web, segnalate da chi le incontra.",
    );
  });

  const NAV = [
    ["Segnalazioni", "/", "Le barriere del web, segnalate da chi le incontra."],
    ["Come funziona", "/come-funziona", "Come trattiamo le segnalazioni"],
    ["Chi siamo", "/chi-siamo", "Chi siamo"],
  ] as const;

  for (const [label, path, heading] of NAV) {
    test(`menu: "${label}" apre la pagina, la segna come attuale e sposta il focus`, async ({
      page,
    }) => {
      await page.goto(path === "/" ? "/privacy" : "/");
      await settled(page);
      await mainNav(page).getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(path);
      const h1 = page.getByRole("heading", { level: 1, name: heading });
      await expect(h1).toBeVisible();
      await expect(h1).toBeFocused();
      await expect(
        mainNav(page).getByRole("link", { name: label }),
      ).toHaveAttribute("aria-current", "page");
      await expect(mainNav(page).locator('[aria-current="page"]')).toHaveCount(
        1,
      );
    });
  }

  test('il pulsante "Invia una segnalazione" apre il modulo', async ({
    page,
  }) => {
    await page.goto("/");
    await header(page)
      .getByRole("link", { name: "Invia una segnalazione" })
      .click();
    await expect(page).toHaveURL("/segnala");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Invia una segnalazione",
    );
    await expect(
      header(page).getByRole("link", { name: "Invia una segnalazione" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("nel dettaglio di un servizio il menu indica 'Segnalazioni'", async ({
    page,
  }) => {
    await page.goto("/segnalazioni/inps-it");
    await settled(page);
    await expect(
      mainNav(page).getByRole("link", { name: "Segnalazioni" }),
    ).toHaveAttribute("aria-current", "page");
  });
});

test.describe("Footer", () => {
  const LINKS = [
    ["Chi siamo", "/chi-siamo", "Chi siamo"],
    [
      "Come trattiamo le segnalazioni",
      "/come-funziona",
      "Come trattiamo le segnalazioni",
    ],
    ["Contatto stampa", "/stampa", "Contatto stampa"],
    ["Privacy", "/privacy", "Privacy"],
  ] as const;

  for (const [label, path, heading] of LINKS) {
    test(`"${label}" apre la pagina giusta`, async ({ page }) => {
      await page.goto("/");
      await settled(page);
      await footerNav(page).getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeFocused();
      await expect(
        footerNav(page).getByRole("link", { name: label }),
      ).toHaveAttribute("aria-current", "page");
    });
  }

  test("riporta che i numeri non misurano l'accessibilità", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toContainText(
      "I numeri contano le segnalazioni ricevute, non misurano l’accessibilità.",
    );
  });
});

test.describe("Salta al contenuto e storia del browser", () => {
  test("il link 'Vai al contenuto' è il primo elemento e porta al contenuto", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Vai al contenuto" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("#contenuto")).toBeFocused();
    // The next Tab starts from the content, not from the header.
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Come funziona" }).last(),
    ).toBeFocused();
  });

  test("indietro e avanti del browser funzionano", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    await mainNav(page).getByRole("link", { name: "Chi siamo" }).click();
    await expect(page).toHaveURL("/chi-siamo");
    await footerNav(page).getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL("/privacy");
    await page.goBack();
    await expect(page).toHaveURL("/chi-siamo");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Chi siamo",
    );
    await page.goBack();
    await expect(page).toHaveURL("/");
    await page.goForward();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Chi siamo",
    );
  });
});

test.describe("Pagina non trovata", () => {
  test("mostra un messaggio chiaro e riporta all'elenco", async ({ page }) => {
    const response = await page.goto("/pagina-inesistente");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle("Pagina non trovata — Barriere Digitali");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Pagina non trovata",
    );
    await page.getByRole("link", { name: "Vai alle segnalazioni" }).click();
    await expect(page).toHaveURL("/");
  });

  test("un servizio inesistente mostra la pagina non trovata", async ({
    page,
  }) => {
    await page.goto("/segnalazioni/servizio-inesistente");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Pagina non trovata",
    );
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});
