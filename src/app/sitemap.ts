import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://barrieredigitali.org";

const PATHS = [
  "/",
  "/segnala",
  "/come-funziona",
  "/chi-siamo",
  "/stampa",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${SITE_URL}${path}` }));
}
