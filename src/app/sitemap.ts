import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";

import { SITE_URL } from "@/lib/site";

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
    // Without a database (e.g. at build time) the sitemap contains only the static pages.
    return pages;
  }
}
