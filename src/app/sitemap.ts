import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";

import { SITE_URL } from "@/lib/site";

const PATHS = ["/", "/segnala", "/come-funziona", "/stampa", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");

  const pages: MetadataRoute.Sitemap = PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
  // Preview builds have no database: they publish only the static pages.
  // With a database configured, errors are not swallowed.
  if (!process.env.DATABASE_URL) return pages;

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
}
