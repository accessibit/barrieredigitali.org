import { expect, test } from "@playwright/test";

import { expectNoViolations, settled } from "./helpers";

const PAGES = [
  ["elenco", "/"],
  ["ricerca", "/?q=satispay"],
  ["nessun risultato", "/?q=nessun-servizio-con-questo-nome.example"],
  ["ordinamento e pagina 3", "/?ordina=recenti&pagina=3"],
  ["dettaglio", "/segnalazioni/inps-it"],
  ["dettaglio, pagina 2", "/segnalazioni/inps-it?pagina=2"],
  ["dettaglio con una segnalazione", "/segnalazioni/ansa-it"],
  ["modulo", "/segnala"],
  ["modulo precompilato", "/segnala?servizio=inps.it"],
  ["come funziona", "/come-funziona"],
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
});

test.describe("Focus visibile", () => {
  test("ogni elemento interattivo raggiunto con Tab mostra un indicatore di focus", async ({
    page,
  }) => {
    await page.goto("/?pagina=2");
    await settled(page);
    const seen = new Set<string>();
    for (let i = 0; i < 45; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        const after = getComputedStyle(el, "::after");
        const visible =
          (style.outlineStyle !== "none" &&
            parseFloat(style.outlineWidth) >= 2) ||
          (after.outlineStyle !== "none" &&
            parseFloat(after.outlineWidth) >= 2) ||
          style.boxShadow !== "none";
        return { key: el.outerHTML.slice(0, 80), visible };
      });
      if (!info || seen.has(info.key)) continue;
      seen.add(info.key);
      expect(info.visible, info.key).toBe(true);
    }
    expect(seen.size).toBeGreaterThan(20);
  });
});

test.describe("Adattamento del layout", () => {
  test("nessuno scorrimento orizzontale a 320px", async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: 320, height: 800 });
    for (const [, path] of PAGES) {
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

  test("le aree cliccabili sono almeno 44×44 px", async ({ page }) => {
    for (const path of ["/", "/segnala", "/segnalazioni/inps-it"]) {
      await page.goto(path);
      await settled(page);
      const small = await page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>(
            "main a, main button, header a, footer a",
          ),
        ]
          .filter(
            (el) =>
              el.offsetParent !== null &&
              !el.classList.contains("rowlink") &&
              !el.classList.contains("sr-only"),
          )
          .filter((el) => !el.closest("p, dd, li.prose-inline"))
          .map((el) => ({
            el: el.outerHTML.slice(0, 60),
            r: el.getBoundingClientRect(),
          }))
          .filter(({ r }) => r.height < 44 || r.width < 44)
          .map(({ el }) => el),
      );
      expect(small, path).toEqual([]);
    }
  });
});
