import { expect, test } from "@playwright/test";

import {
  KIND_LABEL,
  received,
  SECOND,
  SINGLE,
  TOP,
  TOP_REPORT_PAGES,
} from "./fixtures";
import { settled } from "./helpers";

const items = "article ol > li";

test.describe("Dettaglio di un servizio", () => {
  test("mostra nome, tipo, ultima segnalazione e conteggio", async ({
    page,
  }) => {
    await page.goto(`/segnalazioni/${TOP.slug}`);
    await settled(page);
    await expect(page).toHaveTitle(
      `${TOP.name} — segnalazioni — Barriere Digitali`,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(TOP.name);
    await expect(
      page.getByText(`${KIND_LABEL[TOP.kind]} · Ultima segnalazione:`),
    ).toBeVisible();
    await expect(page.getByRole("article")).toContainText(
      `${TOP.count}${received(TOP.count)}`,
    );
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(
      `Segnalazioni, dalla più recente · 1–20 di ${TOP.count}`,
    );
    await expect(page.locator(items)).toHaveCount(20);
    const dates = await page
      .locator(`${items} time`)
      .evaluateAll((els) => els.map((e) => e.getAttribute("datetime") ?? ""));
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test("le segnalazioni sono paginate", async ({ page }) => {
    await page.goto(`/segnalazioni/${TOP.slug}`);
    await settled(page);
    const pager = page.getByRole("navigation", {
      name: "Pagine delle segnalazioni",
    });
    await expect(pager).toContainText(`Pagina 1 di ${TOP_REPORT_PAGES}`);
    await pager.getByRole("link", { name: "Successiva →" }).click();
    await expect(page).toHaveURL(`/segnalazioni/${TOP.slug}?pagina=2`);
    await expect(page.locator("#elenco-segnalazioni")).toBeFocused();
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      `21–40 di ${TOP.count}`,
    );
    await pager
      .getByRole("link", { name: `Pagina ${TOP_REPORT_PAGES}` })
      .click();
    await expect(page.locator(items)).toHaveCount(
      TOP.count - (TOP_REPORT_PAGES - 1) * 20,
    );
    await pager.getByRole("link", { name: "Pagina 1", exact: true }).click();
    await expect(page).toHaveURL(`/segnalazioni/${TOP.slug}`);
  });

  test("con una sola segnalazione: singolare e nessuna paginazione", async ({
    page,
  }) => {
    await page.goto(`/segnalazioni/${SINGLE.slug}`);
    await settled(page);
    await expect(page.getByRole("article")).toContainText(
      "1segnalazione ricevuta",
    );
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(
      "Segnalazioni, dalla più recente",
    );
    await expect(page.locator(items)).toHaveCount(1);
    await expect(
      page.getByRole("navigation", { name: "Pagine delle segnalazioni" }),
    ).toHaveCount(0);
  });

  test("'Segnala un problema su …' apre il modulo già compilato", async ({
    page,
  }) => {
    await page.goto(`/segnalazioni/${SECOND.slug}`);
    await settled(page);
    await page
      .getByRole("link", { name: `Segnala un problema su ${SECOND.name}` })
      .click();
    await expect(page).toHaveURL(
      `/segnala?servizio=${encodeURIComponent(SECOND.name)}`,
    );
    await expect(
      page.getByRole("textbox", { name: /Nome o indirizzo/ }),
    ).toHaveValue(SECOND.name);
  });

  test("'Tutte le segnalazioni' senza elenco visitato porta alla prima pagina", async ({
    page,
  }) => {
    await page.goto(`/segnalazioni/${SECOND.slug}`);
    await settled(page);
    await page.getByRole("link", { name: "← Tutte le segnalazioni" }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("link", { name: SECOND.name, exact: true }),
    ).toBeFocused();
  });
});
