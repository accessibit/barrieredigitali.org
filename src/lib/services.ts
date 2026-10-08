import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import type { ServiceType } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { normalizeName } from "@/lib/normalize";
import { PER_PAGE, REPORTS_PER_PAGE } from "@/lib/site";

export type SortOrder = "count" | "recent";

export type ServiceSummary = {
  id: string;
  slug: string;
  name: string;
  type: ServiceType;
  count: number;
  lastReportAt: Date;
};

export type ServicePage = {
  items: ServiceSummary[];
  total: number;
  page: number;
  pages: number;
  start: number;
};

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Services with at least one published report, with the count and date
 * of the latest report computed on the fly (no denormalized data).
 */
export async function listServices({
  query,
  sort,
  page,
}: {
  query: string;
  sort: SortOrder;
  page: number;
}): Promise<ServicePage> {
  "use cache";
  cacheLife("minutes");
  cacheTag("reports");

  const q = normalizeName(query);
  // Search ignores spaces, hyphens and dots: "comune milano" finds "comune-milano.example".
  const compact = q.replace(/[^\p{L}\p{N}]+/gu, "");
  const filter = !q
    ? Prisma.empty
    : compact
      ? Prisma.sql`AND (s.name_normalized LIKE ${"%" + escapeLike(q) + "%"}
          OR regexp_replace(s.name_normalized, '[^[:alnum:]]+', '', 'g') LIKE ${"%" + escapeLike(compact) + "%"})`
      : Prisma.sql`AND s.name_normalized LIKE ${"%" + escapeLike(q) + "%"}`;

  const [{ total }] = await db.$queryRaw<[{ total: number }]>`
    SELECT COUNT(DISTINCT s.id)::int AS total
    FROM services s
    JOIN reports r ON r.service_id = s.id
      AND r.status = 'PUBLISHED' AND r.published_at IS NOT NULL
    WHERE TRUE ${filter}`;

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * PER_PAGE;

  const order =
    sort === "count"
      ? Prisma.sql`count DESC, "lastReportAt" DESC, s.name ASC`
      : Prisma.sql`"lastReportAt" DESC, count DESC, s.name ASC`;

  const items =
    total === 0
      ? []
      : await db.$queryRaw<ServiceSummary[]>`
    SELECT s.id, s.slug, s.name, s.type,
      COUNT(r.id)::int AS count,
      MAX(r.published_at) AS "lastReportAt"
    FROM services s
    JOIN reports r ON r.service_id = s.id
      AND r.status = 'PUBLISHED' AND r.published_at IS NOT NULL
    WHERE TRUE ${filter}
    GROUP BY s.id
    ORDER BY ${order}
    LIMIT ${PER_PAGE} OFFSET ${start}`;

  return { items, total, page: current, pages, start };
}

/** Detail page header: service, number of published reports and date of the latest one. */
export async function getService(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("reports");

  const service = await db.service.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, type: true },
  });
  if (!service) return null;

  const published = {
    serviceId: service.id,
    status: "PUBLISHED",
    publishedAt: { not: null },
  } as const;
  const [count, latest] = await Promise.all([
    db.report.count({ where: published }),
    db.report.findFirst({
      where: published,
      orderBy: { publishedAt: "desc" },
      select: { publishedAt: true },
    }),
  ]);
  if (count === 0 || !latest?.publishedAt) return null;
  return { ...service, count, lastReportAt: latest.publishedAt };
}

/** One page of a service's published reports, most recent first. */
export async function getServiceReports(
  serviceId: string,
  page: number,
  count: number,
) {
  "use cache";
  cacheLife("minutes");
  cacheTag("reports");

  const pages = Math.max(1, Math.ceil(count / REPORTS_PER_PAGE));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * REPORTS_PER_PAGE;
  const rows = await db.report.findMany({
    where: { serviceId, status: "PUBLISHED", publishedAt: { not: null } },
    orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
    skip: start,
    take: REPORTS_PER_PAGE,
    select: { id: true, description: true, publishedAt: true },
  });
  const reports = rows.map((r) => ({
    id: r.id,
    description: r.description,
    publishedAt: r.publishedAt!,
  }));
  return { reports, page: current, pages, start };
}
