import { z } from "zod";

import { TYPE_OPTIONS } from "@/lib/service-types";

const KINDS = TYPE_OPTIONS.map((o) => o.value) as [
  (typeof TYPE_OPTIONS)[number]["value"],
  ...(typeof TYPE_OPTIONS)[number]["value"][],
];

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Messages identical to the design: they are read after "Errore: ". */
const reportSchema = z.object({
  type: z.enum(KINDS).catch("WEBSITE"),
  site: z
    .string()
    .trim()
    .min(1, "scrivi il nome o l’indirizzo di ciò che vuoi segnalare.")
    .max(
      300,
      "il nome o l’indirizzo è troppo lungo: usa al massimo 300 caratteri.",
    ),
  desc: z
    .string()
    .trim()
    .min(1, "descrivi il problema che hai incontrato.")
    .min(15, "aggiungi qualche dettaglio: cosa stavi cercando di fare?")
    .max(5000, "la descrizione è troppo lunga: usa al massimo 5000 caratteri."),
  email: z
    .string()
    .trim()
    .max(254, "l’email è troppo lunga.")
    .refine(
      (v) => v === "" || EMAIL.test(v),
      "l’email non sembra completa, ad esempio nome@esempio.it. Puoi anche lasciare il campo vuoto.",
    ),
});

export type ReportField = "site" | "desc" | "email";

export const FIELD_LABEL: Record<ReportField, string> = {
  site: "Nome o indirizzo",
  desc: "Descrizione",
  email: "Email",
};

export const FIELD_ID: Record<ReportField, string> = {
  site: "segnala-sito",
  desc: "segnala-descrizione",
  email: "segnala-email",
};

export function validateReport(raw: Record<string, unknown>) {
  const result = reportSchema.safeParse({
    type: raw.type ?? "WEBSITE",
    site: typeof raw.site === "string" ? raw.site : "",
    desc: typeof raw.desc === "string" ? raw.desc : "",
    email: typeof raw.email === "string" ? raw.email : "",
  });
  if (result.success) return { data: result.data, errors: null };
  const errors: Partial<Record<ReportField, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as ReportField;
    if (key in FIELD_LABEL && !errors[key]) errors[key] = issue.message;
  }
  return { data: null, errors };
}
