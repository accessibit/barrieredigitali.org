import { expect, test } from "@playwright/test";

test.describe("Metadati, icone e header", () => {
  test("lingua, titolo, descrizione e anteprima social", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "it");
    await expect(page).toHaveTitle("Segnalazioni — Barriere Digitali");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /barriere/i,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /opengraph-image/,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "it_IT",
    );
    await expect(
      page.locator('link[rel="icon"][type="image/svg+xml"]'),
    ).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  });

  test("icone e immagini social rispondono", async ({ request }) => {
    for (const [path, type] of [
      ["/icon.svg", "image/svg+xml"],
      ["/apple-icon", "image/png"],
      ["/opengraph-image", "image/png"],
    ] as const) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()["content-type"], path).toContain(type);
    }
  });

  test("robots.txt e sitemap con le pagine dei servizi", async ({
    request,
  }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Allow: /");
    expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/come-funziona</loc>");
    expect(sitemap).toContain("/segnalazioni/inps-it</loc>");
  });

  test("header di sicurezza", async ({ request }) => {
    const headers = (await request.get("/")).headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("www reindirizza al dominio principale", async ({ request }) => {
    const res = await request.get("/chi-siamo", {
      headers: { host: "www.barrieredigitali.org" },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(308);
    expect(res.headers().location).toBe(
      "https://barrieredigitali.org/chi-siamo",
    );
  });
});
