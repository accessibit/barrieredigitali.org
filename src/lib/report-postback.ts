import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import type { ReportFormState, ReportFormValues } from "@/app/segnala/actions";
import { db } from "@/lib/db";
import { typeOptionLabel } from "@/lib/service-types";
import type { ReportField } from "@/lib/validation";

/**
 * Submission without JavaScript (Post/Redirect/Get).
 *
 * With Cache Components, Next does not pass the useActionState state to the
 * HTML generated after a submission without JavaScript. In that case the
 * action saves the outcome in a short-lived cookie and redirects to
 * /segnala, which reads it back. With JavaScript enabled this path is never used.
 */
const ERRORS_COOKIE = "bd_modulo";
const SENT_COOKIE = "bd_inviata";
const MAX_AGE = 60;
const MAX_COOKIE_BYTES = 3500;

const options = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/segnala",
  maxAge: MAX_AGE,
};

export async function rememberErrors(
  values: ReportFormValues,
  errors: Partial<Record<ReportField, string>>,
) {
  let payload = JSON.stringify({ values, errors });
  // A cookie cannot exceed ~4 KB: a very long description is not kept.
  if (encodeURIComponent(payload).length > MAX_COOKIE_BYTES) {
    payload = JSON.stringify({ values: { ...values, desc: "" }, errors });
  }
  const store = await cookies();
  store.delete({ name: SENT_COOKIE, path: options.path });
  store.set(ERRORS_COOKIE, payload, options);
}

/** Only the report id: the summary is read back from the database. */
export async function rememberSent(reportId: string) {
  const store = await cookies();
  store.delete({ name: ERRORS_COOKIE, path: options.path });
  store.set(SENT_COOKIE, reportId, options);
}

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const str = (value: unknown) => (typeof value === "string" ? value : "");

/** Initial form state after a submission without JavaScript, if any. */
export const readPostback = cache(
  async function readPostback(): Promise<ReportFormState | null> {
    const store = await cookies();

    const sentId = store.get(SENT_COOKIE)?.value;
    if (sentId) {
      const report = await db.report.findFirst({
        where: {
          id: sentId,
          status: "PENDING",
          createdAt: { gte: new Date(Date.now() - MAX_AGE * 1000) },
        },
        select: {
          submittedType: true,
          submittedName: true,
          description: true,
          email: true,
        },
      });
      if (report) {
        const values = {
          type: report.submittedType,
          site: report.submittedName,
          desc: report.description,
          email: report.email ?? "",
        };
        return {
          status: "sent",
          values,
          recap: {
            kindLabel: typeOptionLabel(report.submittedType),
            ...values,
          },
        };
      }
    }

    const raw = store.get(ERRORS_COOKIE)?.value;
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (
          isStringRecord(parsed) &&
          isStringRecord(parsed.values) &&
          isStringRecord(parsed.errors)
        ) {
          const v = parsed.values;
          const e = parsed.errors;
          const errors: Partial<Record<ReportField, string>> = {};
          for (const key of ["site", "desc", "email"] as const) {
            if (str(e[key])) errors[key] = str(e[key]);
          }
          return {
            status: "error",
            values: {
              type: str(v.type) || "WEBSITE",
              site: str(v.site),
              desc: str(v.desc),
              email: str(v.email),
            },
            errors,
            submission: 1,
          };
        }
      } catch {
        // Invalid cookie: start again from an empty form.
      }
    }
    return null;
  },
);
