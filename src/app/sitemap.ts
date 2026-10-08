import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";

const SITE_URL = process.env.SITE_URL ?? "https://barrieredigitali.org";

const PATHS = [
  "/",
  "/segnala",
  "/come-funziona",
  "/chi-siamo",
  "/stampa",
  "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");

  const pages: MetadataRoute.Sitemap = PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
  try {
    const { db } = await import("@/lib/db");
    const services = await db.service.findMany({
      where: {
        reports: { some: { status: "PUBLISHED", publishedAt: { not: null } } },
      },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    });
    return [
      ...pages,
      ...services.map((s) => ({
        url: `${SITE_URL}/segnalazioni/${s.slug}`,
        lastModified: s.updatedAt,
      })),
    ];
  } catch {
    // Senza database (es. in fase di build) la sitemap contiene solo le pagine fisse.
    return pages;
  }
}
