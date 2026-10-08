"use server";

import { headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

import { db } from "@/lib/db";
import { kindOptionLabel } from "@/lib/kinds";
import { rememberErrors, rememberSent } from "@/lib/report-postback";
import { type ReportField, validateReport } from "@/lib/validation";

export type ReportFormValues = {
  kind: string;
  site: string;
  desc: string;
  email: string;
};

export type ReportFormState =
  | { status: "idle"; values: ReportFormValues }
  | {
      status: "error";
      values: ReportFormValues;
      errors: Partial<Record<ReportField, string>>;
      submission: number;
    }
  | {
      status: "sent";
      values: ReportFormValues;
      recap: { kindLabel: string; site: string; desc: string; email: string };
    };

function read(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitReport(
  previous: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const values: ReportFormValues = {
    kind: read(formData, "kind") || "WEBSITE",
    site: read(formData, "site"),
    desc: read(formData, "desc"),
    email: read(formData, "email"),
  };

  // Le chiamate dal browser con JavaScript portano l'intestazione Next-Action;
  // un normale invio del modulo (JavaScript disattivato) no.
  const withoutJs = !(await headers()).has("next-action");

  const { data, errors } = validateReport(values);
  if (!data) {
    if (withoutJs) {
      await rememberErrors(values, errors);
      redirect("/segnala", RedirectType.replace);
    }
    const submission =
      previous.status === "error" ? previous.submission + 1 : 1;
    return { status: "error", values, errors, submission };
  }

  const recap = {
    kindLabel: kindOptionLabel(data.kind),
    site: data.site,
    desc: data.desc,
    email: data.email,
  };

  // Campo trappola per i bot: se compilato, fingiamo il successo senza salvare.
  if (read(formData, "website_url") !== "") {
    if (withoutJs) redirect("/segnala", RedirectType.replace);
    return { status: "sent", values, recap };
  }

  const report = await db.report.create({
    data: {
      submittedKind: data.kind,
      submittedName: data.site,
      description: data.desc,
      email: data.email || null,
    },
    select: { id: true },
  });

  if (withoutJs) {
    await rememberSent(report.id);
    redirect("/segnala", RedirectType.replace);
  }
  return { status: "sent", values, recap };
}
