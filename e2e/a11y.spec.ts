import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  const summary = violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(summary).toEqual([]);
}

async function settled(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Caricamento delle segnalazioni…")).toHaveCount(
    0,
  );
}

const PAGES = [
  ["elenco", "/"],
  ["nessun risultato", "/?q=nessun-servizio-con-questo-nome.example"],
  ["ordinamento e pagina 3", "/?ordina=recenti&pagina=3"],
  ["dettaglio", "/segnalazioni/negozio-example"],
  ["modulo", "/segnala"],
  ["come funziona", "/come-funziona"],
  ["chi siamo", "/chi-siamo"],
  ["stampa", "/stampa"],
  ["privacy", "/privacy"],
  ["pagina non trovata", "/pagina-che-non-esiste"],
] as const;

test.describe("axe: nessuna violazione WCAG 2.2 AA", () => {
  for (const [name, path] of PAGES) {
    test(name, async ({ page }) => {
      await page.goto(path);
      await settled(page);
      await expect(page.locator("h1")).toHaveCount(1);
      await expectNoViolations(page);
    });
  }

  test("modulo con errori", async ({ page }) => {
    await page.goto("/segnala");
    await page
      .getByLabel(/Email per eventuali aggiornamenti/)
      .fill("mario.rossi@");
    await page.getByRole("button", { name: "Invia segnalazione" }).click();
    await expect(page.locator("#riepilogo-errori")).toBeVisible();
    await expectNoViolations(page);
  });

  test("conferma di invio", async ({ page }) => {
    await page.goto("/segnala?servizio=test-e2e.example");
    await page
      .getByLabel(/Descrivi il problema/)
      .fill(
        "Test automatico: il pulsante di invio non si raggiunge con la tastiera.",
      );
    await page.getByRole("button", { name: "Invia segnalazione" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Grazie, l’abbiamo ricevuta.",
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await expect(page).toHaveTitle("Segnalazione inviata — Barriere Digitali");
    await expectNoViolations(page);
  });
});

test.describe("tastiera e focus", () => {
  test("il link 'Vai al contenuto' porta al contenuto principale", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Vai al contenuto" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("#contenuto")).toBeFocused();
  });

  test("errori: il riepilogo riceve il focus e i link portano ai campi", async ({
    page,
  }) => {
    await page.goto("/segnala");
    await page.getByRole("radio", { name: "App" }).check();
    await page.getByRole("button", { name: "Invia segnalazione" }).click();

    const summary = page.locator("#riepilogo-errori");
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("Correggi 2 campi per inviare");
    await expect(page).toHaveTitle(/^Errori nel modulo — /);
    await expect(page.getByRole("radio", { name: "App" })).toBeChecked();

    const site = page.getByRole("textbox", { name: /Nome o indirizzo/ });
    await expect(site).toHaveAttribute("aria-invalid", "true");
    await page.getByRole("link", { name: /^Nome o indirizzo:/ }).click();
    await expect(site).toBeFocused();
  });

  test("dopo la navigazione il focus va sul titolo della pagina", async ({
    page,
  }) => {
    await page.goto("/");
    await settled(page);
    await page
      .getByRole("navigation", { name: "Principale" })
      .getByRole("link", { name: "Chi siamo" })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Chi siamo" }),
    ).toBeFocused();
    await expect(
      page.getByRole("link", { name: "Chi siamo" }).first(),
    ).toHaveAttribute("aria-current", "page");
  });

  test("dal dettaglio si torna al servizio nell'elenco", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    await page.getByRole("link", { name: "negozio.example" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "negozio.example" }),
    ).toBeFocused();
    await page.getByRole("link", { name: "← Tutte le segnalazioni" }).click();
    await expect(
      page.getByRole("link", { name: "negozio.example" }),
    ).toBeFocused();
  });

  test("cambiando pagina il focus va sul riepilogo dei risultati", async ({
    page,
  }) => {
    await page.goto("/");
    await settled(page);
    await page.getByRole("link", { name: "Successiva →" }).click();
    await expect(page).toHaveURL(/pagina=2/);
    await expect(page.locator("#risultati")).toBeFocused();
    await expect(
      page.getByRole("link", { name: "Pagina 2, pagina attuale" }),
    ).toBeVisible();
  });

  test("la ricerca aggiorna l'elenco e lo annuncia", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    await page
      .getByRole("searchbox", { name: "Cerca tra le segnalazioni" })
      .fill("banca");
    await expect(page).toHaveURL(/q=banca/);
    await expect(page.getByRole("status")).toContainText("1 risultato");
    await page.getByRole("link", { name: "Cancella la ricerca" }).click();
    await expect(page.getByRole("searchbox")).toBeFocused();
    await expect(page.getByRole("searchbox")).toHaveValue("");
  });
});

test.describe("adattamento del layout", () => {
  test("nessuno scorrimento orizzontale a 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const path of ["/", "/segnalazioni/negozio-example", "/segnala"]) {
      await page.goto(path);
      await settled(page);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});
