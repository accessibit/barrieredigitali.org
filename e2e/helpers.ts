import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";
import { Pool } from "pg";

export const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
];

export async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  const summary = violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(summary).toEqual([]);
}

/** Aspetta che i contenuti in streaming siano arrivati. */
export async function settled(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Caricamento delle segnalazioni…")).toHaveCount(
    0,
  );
}

export function serviceList(page: Page): Locator {
  return page.getByRole("list", { name: "Servizi segnalati" });
}

export function rows(page: Page): Locator {
  return serviceList(page).getByRole("listitem");
}

export async function rowCounts(page: Page): Promise<number[]> {
  const texts = await rows(page).locator("b").allTextContents();
  return texts.map(Number);
}

export async function rowDates(page: Page): Promise<string[]> {
  return rows(page)
    .locator("time")
    .evaluateAll((els) => els.map((e) => e.getAttribute("datetime") ?? ""));
}

export function header(page: Page) {
  return page.getByRole("banner");
}

export function mainNav(page: Page) {
  return page.getByRole("navigation", { name: "Principale" });
}

export function footerNav(page: Page) {
  return page.getByRole("navigation", { name: "Informazioni" });
}

/** Accesso diretto al database locale, per verificare cosa salva il modulo. */
let pool: Pool | undefined;
export function db() {
  pool ??= new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://barriere:barriere@localhost:5433/barriere",
  });
  return pool;
}

export async function findReport(submittedName: string) {
  const { rows } = await db().query(
    `SELECT submitted_kind, submitted_name, description, email, status, service_id
       FROM reports WHERE submitted_name = $1 ORDER BY created_at DESC`,
    [submittedName],
  );
  return rows as Array<{
    submitted_kind: string;
    submitted_name: string;
    description: string;
    email: string | null;
    status: string;
    service_id: string | null;
  }>;
}

export async function deleteE2eReports() {
  await db().query(`DELETE FROM reports WHERE submitted_name LIKE 'e2e-%'`);
}

export function uniqueName(label: string) {
  return `e2e-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}.example`;
}
