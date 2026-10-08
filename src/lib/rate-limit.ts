import "server-only";

import { createHmac } from "node:crypto";

import { headers } from "next/headers";

import { db } from "@/lib/db";

const WINDOW_MINUTES = 10;
const MAX_PER_WINDOW = 5;
const MAX_PER_DAY = 20;

/**
 * Daily HMAC of the client IP. The IP is never stored, and the date in the
 * HMAC input makes hashes from different days unlinkable. Requires
 * IP_HASH_SECRET in production; without it, rate limiting is skipped.
 */
export async function clientIpHash(): Promise<string | null> {
  const secret =
    process.env.IP_HASH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "development");
  if (!secret) return null;

  const h = await headers();
  // On Vercel, x-forwarded-for is set by the platform (first entry = client).
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  if (!ip) return null;

  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", secret).update(`${day}|${ip}`).digest("hex");
}

export type SubmissionCheck =
  | { outcome: "ok" }
  | { outcome: "duplicate"; reportId: string }
  | { outcome: "limited" };

/**
 * Decides whether a new report can be saved:
 * - an identical report sent in the last minutes is treated as already saved
 *   (double clicks, retries, browser resubmissions);
 * - beyond MAX_PER_WINDOW reports in WINDOW_MINUTES, or MAX_PER_DAY per day,
 *   from the same IP hash, the submission is refused.
 */
export async function checkSubmission(
  ipHash: string | null,
  report: { submittedName: string; description: string },
): Promise<SubmissionCheck> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60_000);

  const duplicate = await db.report.findFirst({
    where: {
      status: "PENDING",
      createdAt: { gte: windowStart },
      submittedName: report.submittedName,
      description: report.description,
      ...(ipHash ? { ipHash } : {}),
    },
    select: { id: true },
  });
  if (duplicate) return { outcome: "duplicate", reportId: duplicate.id };

  if (!ipHash) return { outcome: "ok" };

  const dayStart = new Date(Date.now() - 24 * 60 * 60_000);
  const [inWindow, inDay] = await Promise.all([
    db.report.count({ where: { ipHash, createdAt: { gte: windowStart } } }),
    db.report.count({ where: { ipHash, createdAt: { gte: dayStart } } }),
  ]);
  if (inWindow >= MAX_PER_WINDOW || inDay >= MAX_PER_DAY) {
    return { outcome: "limited" };
  }
  return { outcome: "ok" };
}

export const LIMITED_MESSAGE =
  "Hai inviato molte segnalazioni in poco tempo. Riprova tra qualche minuto.";
