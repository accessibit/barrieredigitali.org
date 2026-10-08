/**
 * Editorial audit of real Italian websites.
 *
 *   npm run audit:scan                   # all targets
 *   npm run audit:scan -- inps.it tim.it # only these
 *
 * For each target it checks the home page and up to two key pages linked from
 * it (contacts, services, accessibility, help): axe-core WCAG 2.2 AA plus a
 * reflow check at 320 CSS px. Only serious/critical findings with a curated
 * Italian text (rules.ts) become reports. Output, for human review:
 *   audit-results/<date>.json  (evidence, input of audit:import)
 *   audit-results/<date>.md    (readable summary)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { type Browser, chromium, type Page } from "@playwright/test";
import axe from "axe-core";

import { RULE_TEXT } from "./rules";
import { AUDIT_TARGETS, type AuditTarget } from "./targets";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const KEY_PAGE = /contatt|serviz|accessibilit|assistenza|aiuto|supporto/i;
const MAX_EXTRA_PAGES = 2;
const MAX_REPORTS_PER_SERVICE = 6;
const CONCURRENCY = 3;
// A standard desktop Chrome user agent, as accessibility tools such as
// Lighthouse use: some public sites reject headless or unknown agents.
// Traffic stays minimal (at most 3 pages per site, 3 sites at a time).
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

/** Rules in order of impact on people: earlier ones are kept first. */
const PRIORITY = [
  "meta-viewport",
  "button-name",
  "link-name",
  "label",
  "select-name",
  "image-alt",
  "input-image-alt",
  "reflow",
  "scrollable-region-focusable",
  "nested-interactive",
  "aria-hidden-focus",
  "color-contrast",
  "aria-input-field-name",
  "aria-command-name",
  "aria-toggle-field-name",
  "frame-title",
  "document-title",
  "html-has-lang",
  "html-lang-valid",
  "video-caption",
  "role-img-alt",
  "svg-img-alt",
  "target-size",
  "link-in-text-block",
  "autocomplete-valid",
  "aria-required-children",
  "aria-required-parent",
  "td-headers-attr",
  "th-has-data-cells",
  "list",
  "listitem",
];

export type AuditFinding = {
  rule: string;
  wcag: string[];
  text: string;
  pageUrl: string;
  pageTitle: string;
  count: number;
  /** CSS selectors and HTML of up to 3 affected elements. */
  samples: { target: string; html: string }[];
};

export type AuditService = {
  name: string;
  url: string;
  pagesChecked: { url: string; title: string }[];
  findings: AuditFinding[];
  error?: string;
};

export type AuditResult = {
  generatedAt: string;
  axeVersion: string;
  tool: string;
  services: AuditService[];
};

/**
 * "nella home page", or "nella pagina «…»" named after the page's first h1:
 * many sites reuse the same <title> on every page.
 */
async function where(page: Page, isHome: boolean, title: string) {
  if (isHome) return "nella home page";
  // Prefer the heading of the main content: the first h1 is often the logo.
  const h1 = await page
    .locator("main h1, [role=main] h1, h1")
    .first()
    .innerText({ timeout: 2_000 })
    .catch(() => "");
  const name = (h1 || title.split(/\s[|–—-]\s/)[0] || title)
    .replace(/\s+/g, " ")
    .trim();
  if (!name) return "in una pagina interna";
  return `nella pagina «${name.length > 70 ? `${name.slice(0, 67)}…` : name}»`;
}

async function settle(page: Page) {
  // Some sites keep the DOM loading for a long time: audit what is there.
  await page
    .waitForLoadState("domcontentloaded", { timeout: 30_000 })
    .catch(() => undefined);
  await page
    .waitForLoadState("networkidle", { timeout: 15_000 })
    .catch(() => undefined);
  await page.waitForTimeout(1_500);
}

async function keyPages(page: Page, home: URL): Promise<string[]> {
  const links = await page.$$eval(
    "header a[href], nav a[href], footer a[href]",
    (anchors) =>
      anchors.map((a) => ({
        href: (a as HTMLAnchorElement).href,
        text: a.textContent ?? "",
      })),
  );
  const seen = new Set<string>();
  const out: string[] = [];
  for (const { href, text } of links) {
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      continue;
    }
    if (url.hostname !== home.hostname || !/^https?:$/.test(url.protocol))
      continue;
    url.hash = "";
    const key = url.toString();
    if (seen.has(key) || key === home.toString()) continue;
    if (!KEY_PAGE.test(text) && !KEY_PAGE.test(url.pathname)) continue;
    seen.add(key);
    out.push(key);
    if (out.length >= MAX_EXTRA_PAGES) break;
  }
  return out;
}

/** Elements hidden on purpose for assistive technology (e.g. skip links). */
const VISUALLY_HIDDEN =
  /visually-hidden|sr-only|screen-reader|skip-?link|skip-to/i;

type AxeNode = { target: string[]; html: string };

/** Serious/critical violations of rules with a curated text, per rule. */
async function relevantNodes(page: Page): Promise<Map<string, AxeNode[]>> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  const out = new Map<string, AxeNode[]>();
  for (const v of violations) {
    if (v.impact !== "serious" && v.impact !== "critical") continue;
    if (!RULE_TEXT[v.id]) continue;
    const nodes = v.nodes
      .filter((n) => !VISUALLY_HIDDEN.test(n.html))
      .map((n) => ({ target: n.target.map(String), html: n.html }));
    if (nodes.length > 0) out.set(v.id, nodes);
  }
  return out;
}

async function auditPage(
  browser: Browser,
  url: string,
  isHome: boolean,
): Promise<{
  title: string;
  findings: AuditFinding[];
  links: string[];
}> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "it-IT",
    userAgent: USER_AGENT,
  });
  const page = await context.newPage();
  try {
    const response = await page.goto(url, {
      waitUntil: "commit",
      timeout: 45_000,
    });
    if (!response || response.status() >= 400) {
      throw new Error(`HTTP ${response?.status() ?? "nessuna risposta"}`);
    }
    await settle(page);
    const title = (await page.title()).trim();
    const label = await where(page, isHome, title);

    // Two axe runs 10 seconds apart: only elements failing in both are
    // kept, so content still being filled in by JavaScript is not reported.
    const first = await relevantNodes(page);
    await page.waitForTimeout(10_000);
    const second = await relevantNodes(page);
    const findings: AuditFinding[] = [];
    for (const [rule, nodes] of second) {
      const before = new Set(
        (first.get(rule) ?? []).map((n) => n.target.join(" ")),
      );
      const stable = nodes.filter((n) => before.has(n.target.join(" ")));
      if (stable.length === 0) continue;
      findings.push({
        rule,
        wcag: RULE_TEXT[rule]!.wcag,
        text: RULE_TEXT[rule]!.text(label, stable.length),
        pageUrl: page.url(),
        pageTitle: title,
        count: stable.length,
        samples: stable.slice(0, 3).map((n) => ({
          target: n.target.join(" "),
          html: n.html.slice(0, 300),
        })),
      });
    }

    const links = isHome ? await keyPages(page, new URL(page.url())) : [];

    // Reflow at 320 CSS px (WCAG 1.4.10), on a narrow viewport.
    await page.setViewportSize({ width: 320, height: 800 });
    await page.waitForTimeout(800);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    // A few pixels can come from rounding or scrollbars: report clear overflow only.
    if (overflow > 20) {
      findings.push({
        rule: "reflow",
        wcag: RULE_TEXT.reflow!.wcag,
        text: RULE_TEXT.reflow!.text(label, 1),
        pageUrl: page.url(),
        pageTitle: title,
        count: 1,
        samples: [
          {
            target: "html",
            html: `scrollWidth eccede la finestra di ${overflow}px a 320px`,
          },
        ],
      });
    }
    return { title, findings, links };
  } finally {
    await context.close();
  }
}

async function auditService(
  browser: Browser,
  target: AuditTarget,
): Promise<AuditService> {
  const result: AuditService = {
    name: target.name,
    url: target.url,
    pagesChecked: [],
    findings: [],
  };
  try {
    // One retry: transient network errors and mid-load navigations are common.
    const home = await auditPage(browser, target.url, true).catch(() =>
      auditPage(browser, target.url, true),
    );
    result.pagesChecked.push({ url: target.url, title: home.title });
    const all = [...home.findings];
    for (const link of home.links) {
      try {
        const sub = await auditPage(browser, link, false);
        result.pagesChecked.push({ url: link, title: sub.title });
        all.push(...sub.findings);
      } catch {
        // A key page that does not load is skipped; the home page still counts.
      }
    }
    // One report per rule per service (the page with most elements wins),
    // ordered by impact, capped per service.
    const byRule = new Map<string, AuditFinding>();
    for (const f of all) {
      const current = byRule.get(f.rule);
      if (!current || f.count > current.count) byRule.set(f.rule, f);
    }
    result.findings = [...byRule.values()]
      .sort((a, b) => PRIORITY.indexOf(a.rule) - PRIORITY.indexOf(b.rule))
      .slice(0, MAX_REPORTS_PER_SERVICE);
  } catch (error) {
    result.error =
      error instanceof Error ? error.message.split("\n")[0] : String(error);
  }
  return result;
}

function markdown(result: AuditResult): string {
  const lines = [
    `# Audit redazionale — ${result.generatedAt.slice(0, 10)}`,
    "",
    `Strumenti: ${result.tool}, axe-core ${result.axeVersion}. Rivedere ogni voce prima di \`npm run audit:import\`.`,
    "",
  ];
  for (const s of result.services) {
    lines.push(`## ${s.name}`, "");
    if (s.error) {
      lines.push(`Non verificato: ${s.error}`, "");
      continue;
    }
    lines.push(`Pagine: ${s.pagesChecked.map((p) => p.url).join(", ")}`, "");
    if (s.findings.length === 0)
      lines.push(
        "Nessun problema serio rilevato dai controlli automatici.",
        "",
      );
    for (const f of s.findings) {
      lines.push(
        `- ${f.text}`,
        `  - ${f.rule} · WCAG ${f.wcag.join(", ")} · ${f.pageUrl}`,
      );
      for (const sample of f.samples) lines.push(`  - \`${sample.target}\``);
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const only = process.argv.slice(2);
  const targets = only.length
    ? AUDIT_TARGETS.filter((t) => only.includes(t.name))
    : AUDIT_TARGETS;
  if (targets.length === 0)
    throw new Error(`Nessun target corrisponde a: ${only.join(", ")}`);

  const browser = await chromium.launch();
  const services: AuditService[] = [];
  const queue = [...targets];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let target = queue.shift(); target; target = queue.shift()) {
        const service = await auditService(browser, target);
        services.push(service);
        console.log(
          `${service.error ? "✗" : "✓"} ${service.name}: ${service.error ?? `${service.findings.length} segnalazioni, ${service.pagesChecked.length} pagine`}`,
        );
      }
    }),
  );
  await browser.close();

  const order = new Map(targets.map((t, i) => [t.name, i]));
  services.sort((a, b) => order.get(a.name)! - order.get(b.name)!);
  const result: AuditResult = {
    generatedAt: new Date().toISOString(),
    axeVersion: axe.version,
    tool: "Playwright (Chromium) + @axe-core/playwright",
    services,
  };
  const dir = path.join(process.cwd(), "audit-results");
  mkdirSync(dir, { recursive: true });
  const base = path.join(dir, result.generatedAt.slice(0, 10));
  writeFileSync(`${base}.json`, JSON.stringify(result, null, 2));
  writeFileSync(`${base}.md`, markdown(result));
  const total = services.reduce((sum, s) => sum + s.findings.length, 0);
  console.log(
    `\n${total} segnalazioni su ${services.length} servizi → ${base}.json / .md`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
