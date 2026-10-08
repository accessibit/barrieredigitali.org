import "server-only";

import { cache } from "react";

import { Prisma } from "@/generated/prisma/client";
import type { ServiceKind } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { normalizeName } from "@/lib/normalize";
import { PER_PAGE } from "@/lib/site";

export type SortOrder = "count" | "recent";

export type ServiceSummary = {
  id: string;
  slug: string;
  name: string;
  kind: ServiceKind;
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
 * Servizi con almeno una segnalazione pubblicata, con conteggio e data
 * dell'ultima segnalazione calcolati al volo (nessun dato denormalizzato).
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
  const q = normalizeName(query);
  const filter = q
    ? Prisma.sql`AND s.name_normalized LIKE ${"%" + escapeLike(q) + "%"}`
    : Prisma.empty;

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
    SELECT s.id, s.slug, s.name, s.kind,
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

/** Dettaglio di un servizio con le sue segnalazioni pubblicate, dalla più recente. */
export const getService = cache(async function getService(slug: string) {
  const service = await db.service.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      kind: true,
      reports: {
        where: { status: "PUBLISHED", publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        select: { id: true, description: true, publishedAt: true },
      },
    },
  });
  if (!service || service.reports.length === 0) return null;
  const reports = service.reports.map((r) => ({
    id: r.id,
    description: r.description,
    publishedAt: r.publishedAt!,
  }));
  return {
    ...service,
    reports,
    count: reports.length,
    lastReportAt: reports[0]!.publishedAt,
  };
});
