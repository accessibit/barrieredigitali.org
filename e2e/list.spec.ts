import { expect, test } from "@playwright/test";

import {
  DOTTED,
  KIND_LABEL,
  LAST_PAGE_ROWS,
  PAGES,
  received,
  SECOND,
  SINGLE,
  TOP,
  TOTAL,
  UNIQUE_QUERY,
  UNIQUE_RESULT,
} from "./fixtures";
import { rowCounts, rowDates, rows, serviceList, settled } from "./helpers";

const BY_COUNT = `${TOTAL} risultati, ordinati dal più segnalato`;
const BY_DATE = `${TOTAL} risultati, ordinati dalla segnalazione più recente`;

test.describe("Elenco", () => {
  test("mostra 25 servizi ordinati dal più segnalato, con posizione e conteggio", async ({
    page,
  }) => {
    await page.goto("/");
    await settled(page);
    await expect(page.getByRole("status")).toHaveText(BY_COUNT);
    await expect(rows(page)).toHaveCount(25);
    const counts = await rowCounts(page);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    const first = rows(page).first();
    await expect(first.getByRole("heading", { level: 2 })).toHaveText(
      `1. ${TOP.name} ${KIND_LABEL[TOP.kind]}`,
    );
    await expect(first).toContainText(`${TOP.count}${received(TOP.count)}`);
    await expect(
      page.getByRole("button", { name: "Più segnalati" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("al singolare: '1 segnalazione ricevuta' e '1 risultato'", async ({
    page,
  }) => {
    await page.goto(`/?q=${encodeURIComponent(SINGLE.name)}`);
    await settled(page);
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first()).toContainText("1segnalazione ricevuta");
    await expect(page.getByRole("status")).toHaveText("1 risultato");
  });

  test("ogni riga ha un solo link e tutta la riga è cliccabile", async ({
    page,
  }) => {
    await page.goto("/");
    await settled(page);
    const row = rows(page).nth(1);
    await expect(row.getByRole("link")).toHaveCount(1);
    // Click sul riquadro del conteggio, fuori dal nome: lo copre il link esteso alla riga.
    const box = (await row.locator("b").boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page).toHaveURL(`/segnalazioni/${SECOND.slug}`);
    await expect(
      page.getByRole("heading", { level: 1, name: SECOND.name }),
    ).toBeFocused();
  });
});

test.describe("Ordinamento", () => {
  test('"Più recenti" ordina per data e toglie la posizione', async ({
    page,
  }) => {
    await page.goto("/");
    await settled(page);
    await page.getByRole("button", { name: "Più recenti" }).click();
    await expect(page).toHaveURL(/ordina=recenti/);
    await expect(page.getByRole("status")).toHaveText(BY_DATE);
    await expect(
      page.getByRole("button", { name: "Più recenti" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: "Più segnalati" }),
    ).toHaveAttribute("aria-pressed", "false");
    const dates = await rowDates(page);
    expect(dates).toEqual([...dates].sort().reverse());
    await expect(rows(page).first().getByRole("heading")).not.toContainText(
      "1.",
    );

    await page.getByRole("button", { name: "Più segnalati" }).click();
    await expect(page).not.toHaveURL(/ordina=recenti/);
    await expect(page.getByRole("status")).toHaveText(BY_COUNT);
  });

  test("cambiare ordinamento mantiene la ricerca e torna a pagina 1", async ({
    page,
  }) => {
    await page.goto("/?q=comune&pagina=2");
    await settled(page);
    await page.getByRole("button", { name: "Più recenti" }).click();
    await expect(page).toHaveURL(/q=comune/);
    await expect(page).toHaveURL(/ordina=recenti/);
    await expect(page).not.toHaveURL(/pagina=/);
  });
});

test.describe("Ricerca", () => {
  test("filtra mentre si scrive, senza ricaricare la pagina", async ({
    page,
  }) => {
    await page.goto("/");
    await settled(page);
    await page.evaluate(
      () => ((window as unknown as { marker: number }).marker = 1),
    );
    const search = page.getByRole("searchbox", {
      name: "Cerca tra le segnalazioni",
    });
    await search.pressSequentially(UNIQUE_QUERY, { delay: 30 });
    await expect(page).toHaveURL(new RegExp(`q=${UNIQUE_QUERY}`));
    await expect(page.getByRole("status")).toHaveText("1 risultato");
    await expect(rows(page).first()).toContainText(UNIQUE_RESULT.name);
    expect(
      await page.evaluate(
        () => (window as unknown as { marker?: number }).marker,
      ),
    ).toBe(1);
    await expect(search).toBeFocused();
  });

  test("ignora maiuscole, protocollo, www, spazi, punti e trattini", async ({
    page,
  }) => {
    for (const q of [
      `https://www.${TOP.name.toUpperCase()}/servizi`,
      DOTTED.name.replaceAll(".", " ").replace(/ it$/, ""),
      DOTTED.name.replaceAll(".", ""),
    ]) {
      await page.goto(`/?q=${encodeURIComponent(q)}`);
      await settled(page);
      expect(await rows(page).count(), q).toBeGreaterThan(0);
    }
  });

  test("Invio nel campo di ricerca invia la ricerca e mantiene l'ordinamento", async ({
    page,
  }) => {
    await page.goto("/?ordina=recenti");
    await settled(page);
    const search = page.getByRole("searchbox", {
      name: "Cerca tra le segnalazioni",
    });
    await search.fill("comune");
    await search.press("Enter");
    await expect(page).toHaveURL(/q=comune/);
    await expect(page).toHaveURL(/ordina=recenti/);
    await expect(serviceList(page)).toContainText("comune");
  });

  test('il pulsante "Cancella la ricerca" svuota il campo e ripristina l\'elenco', async ({
    page,
  }) => {
    await page.goto(`/?q=${UNIQUE_QUERY}`);
    await settled(page);
    const clear = page.getByRole("link", { name: "Cancella la ricerca" });
    await expect(clear).toBeVisible();
    await clear.click();
    const search = page.getByRole("searchbox", {
      name: "Cerca tra le segnalazioni",
    });
    await expect(search).toHaveValue("");
    await expect(search).toBeFocused();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("status")).toHaveText(BY_COUNT);
    await expect(clear).toHaveCount(0);
  });

  test("nessun risultato: propone di segnalare il servizio o di vedere tutto", async ({
    page,
  }) => {
    await page.goto("/");
    await settled(page);
    await page
      .getByRole("searchbox", { name: "Cerca tra le segnalazioni" })
      .fill("zzz-nessuno");
    await expect(page.getByRole("status")).toHaveText("Nessun risultato");
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(
      "Nessun risultato per “zzz-nessuno”",
    );

    await page
      .getByRole("link", { name: "Mostra tutte le segnalazioni" })
      .click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("searchbox")).toHaveValue("");
    await expect(rows(page)).toHaveCount(25);

    await page.goto("/?q=zzz-nessuno");
    await page.getByRole("link", { name: "Segnala “zzz-nessuno”" }).click();
    await expect(page).toHaveURL("/segnala?servizio=zzz-nessuno");
    await expect(
      page.getByRole("textbox", { name: /Nome o indirizzo/ }),
    ).toHaveValue("zzz-nessuno");
  });
});

test.describe("Paginazione", () => {
  test("Successiva, Precedente e numeri di pagina", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    const pager = page.getByRole("navigation", {
      name: "Pagine dei risultati",
    });
    await expect(pager).toContainText(
      `Risultati 1–25 di ${TOTAL} · pagina 1 di ${PAGES}`,
    );
    await expect(pager.getByRole("link", { name: "← Precedente" })).toHaveCount(
      0,
    );

    await pager.getByRole("link", { name: "Successiva →" }).click();
    await expect(page).toHaveURL("/?pagina=2");
    await expect(page.locator("#risultati")).toBeFocused();
    await expect(pager).toContainText(
      `Risultati 26–50 di ${TOTAL} · pagina 2 di ${PAGES}`,
    );
    await expect(rows(page).first().getByRole("heading")).toContainText("26.");

    await pager.getByRole("link", { name: `Pagina ${PAGES}` }).click();
    await expect(page).toHaveURL(`/?pagina=${PAGES}`);
    await expect(
      pager.getByRole("link", { name: `Pagina ${PAGES}, pagina attuale` }),
    ).toHaveAttribute("aria-current", "page");
    await expect(pager.getByRole("link", { name: "Successiva →" })).toHaveCount(
      0,
    );
    await expect(rows(page)).toHaveCount(LAST_PAGE_ROWS);

    await pager.getByRole("link", { name: "← Precedente" }).click();
    await expect(page).toHaveURL(`/?pagina=${PAGES - 1}`);

    await pager.getByRole("link", { name: "Pagina 1", exact: true }).click();
    await expect(page).toHaveURL("/");
  });

  test("una pagina fuori intervallo mostra l'ultima disponibile", async ({
    page,
  }) => {
    await page.goto("/?pagina=999");
    await settled(page);
    await expect(
      page.getByRole("link", { name: `Pagina ${PAGES}, pagina attuale` }),
    ).toBeVisible();
  });

  test("tornando dal dettaglio si ritrova la stessa pagina e il focus sul servizio", async ({
    page,
  }) => {
    await page.goto("/?ordina=recenti&pagina=2");
    await settled(page);
    const link = rows(page).nth(4).getByRole("link");
    const name = (await link.textContent())!;
    await link.click();
    await expect(page.getByRole("heading", { level: 1, name })).toBeFocused();
    await page.getByRole("link", { name: "← Tutte le segnalazioni" }).click();
    await expect(page).toHaveURL("/?ordina=recenti&pagina=2");
    await expect(page.getByRole("link", { name, exact: true })).toBeFocused();
  });
});

test.describe("Senza JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("ricerca, ordinamento, cancellazione e paginazione funzionano", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("status")).toHaveText(BY_COUNT);

    await page
      .getByRole("searchbox", { name: "Cerca tra le segnalazioni" })
      .fill(UNIQUE_QUERY);
    await page.getByRole("searchbox").press("Enter");
    await expect(page).toHaveURL(new RegExp(`q=${UNIQUE_QUERY}`));
    await expect(page.getByRole("status")).toHaveText("1 risultato");

    await page.getByRole("link", { name: "Cancella la ricerca" }).click();
    await expect(page.getByRole("status")).toHaveText(BY_COUNT);

    await page.getByRole("button", { name: "Più recenti" }).click();
    await expect(page).toHaveURL(/ordina=recenti/);
    await expect(page.getByRole("status")).toHaveText(BY_DATE);

    await page.getByRole("link", { name: "Successiva →" }).click();
    await expect(page).toHaveURL(/pagina=2/);
    await expect(page).toHaveURL(/ordina=recenti/);
  });
});
