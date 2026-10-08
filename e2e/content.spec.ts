import { expect, test } from "@playwright/test";

const PAGES = [
  {
    path: "/come-funziona",
    title: "Come trattiamo le segnalazioni — Barriere Digitali",
    h2: [
      "Dalla ricezione alla pubblicazione",
      "Cosa indicano i numeri",
      "Se gestisci un servizio segnalato",
    ],
  },
  {
    path: "/stampa",
    title: "Contatto stampa — Barriere Digitali",
    h2: ["Contatti", "Prima di citare una segnalazione"],
  },
  {
    path: "/privacy",
    title: "Privacy — Barriere Digitali",
    h2: ["Dati raccolti", "Titolare e conservazione", "I tuoi diritti"],
  },
];

for (const { path, title, h2 } of PAGES) {
  test(`${path}: titolo, struttura dei titoli e segnaposto`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(h2);
    // Data still to be defined is highlighted, not hidden.
    const placeholders = page.locator(".placeholder-mark");
    for (const text of await placeholders.allTextContents())
      expect(text).toMatch(/^\[.+\]$/);
  });
}

test("Come funziona: i tre passaggi sono una lista ordinata", async ({
  page,
}) => {
  await page.goto("/come-funziona");
  const steps = page
    .getByRole("list")
    .filter({ hasText: "Ricezione." })
    .getByRole("listitem");
  await expect(steps).toHaveCount(3);
  await expect(steps.nth(1)).toContainText("Verifica.");
});
