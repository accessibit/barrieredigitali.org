import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import type { ReportFormState, ReportFormValues } from "@/app/segnala/actions";
import { db } from "@/lib/db";
import { kindOptionLabel } from "@/lib/kinds";
import type { ReportField } from "@/lib/validation";

/**
 * Invio senza JavaScript (Post/Redirect/Get).
 *
 * Con Cache Components, Next non passa lo stato di useActionState all'HTML
 * generato dopo un invio senza JavaScript. In quel caso l'azione salva
 * l'esito in un cookie di breve durata e reindirizza a /segnala, che lo
 * rilegge. Con JavaScript attivo questo percorso non viene mai usato.
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
  // Un cookie non supera ~4 KB: una descrizione molto lunga non viene conservata.
  if (encodeURIComponent(payload).length > MAX_COOKIE_BYTES) {
    payload = JSON.stringify({ values: { ...values, desc: "" }, errors });
  }
  const store = await cookies();
  store.delete({ name: SENT_COOKIE, path: options.path });
  store.set(ERRORS_COOKIE, payload, options);
}

/** Solo l'id della segnalazione: il riepilogo si rilegge dal database. */
export async function rememberSent(reportId: string) {
  const store = await cookies();
  store.delete({ name: ERRORS_COOKIE, path: options.path });
  store.set(SENT_COOKIE, reportId, options);
}

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const str = (value: unknown) => (typeof value === "string" ? value : "");

/** Stato iniziale del modulo dopo un invio senza JavaScript, se presente. */
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
          submittedKind: true,
          submittedName: true,
          description: true,
          email: true,
        },
      });
      if (report) {
        const values = {
          kind: report.submittedKind,
          site: report.submittedName,
          desc: report.description,
          email: report.email ?? "",
        };
        return {
          status: "sent",
          values,
          recap: {
            kindLabel: kindOptionLabel(report.submittedKind),
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
              kind: str(v.kind) || "WEBSITE",
              site: str(v.site),
              desc: str(v.desc),
              email: str(v.email),
            },
            errors,
            submission: 1,
          };
        }
      } catch {
        // Cookie non valido: si riparte da un modulo vuoto.
      }
    }
    return null;
  },
);
