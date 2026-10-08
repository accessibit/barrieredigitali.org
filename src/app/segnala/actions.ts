"use server";

import { headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

import { db } from "@/lib/db";
import { typeOptionLabel } from "@/lib/service-types";
import { rememberErrors, rememberSent } from "@/lib/report-postback";
import { type ReportField, validateReport } from "@/lib/validation";

export type ReportFormValues = {
  type: string;
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
    type: read(formData, "type") || "WEBSITE",
    site: read(formData, "site"),
    desc: read(formData, "desc"),
    email: read(formData, "email"),
  };

  // Calls from the browser with JavaScript carry the Next-Action header;
  // a plain form submission (JavaScript disabled) does not.
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
    kindLabel: typeOptionLabel(data.type),
    site: data.site,
    desc: data.desc,
    email: data.email,
  };

  // Honeypot field for bots: if filled in, we fake success without saving.
  if (read(formData, "website_url") !== "") {
    if (withoutJs) redirect("/segnala", RedirectType.replace);
    return { status: "sent", values, recap };
  }

  const report = await db.report.create({
    data: {
      submittedType: data.type,
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
