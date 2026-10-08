"use client";

import type { Ref } from "react";

import { FIELD_ID, FIELD_LABEL, type ReportField } from "@/lib/validation";

const ORDER: ReportField[] = ["site", "desc", "email"];

export function ErrorSummary({
  errors,
  notice,
  ref,
}: {
  errors: Partial<Record<ReportField, string>>;
  /** Message not tied to a field, e.g. too many submissions. */
  notice?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  const fields = ORDER.filter((f) => errors[f]);
  if (fields.length === 0 && notice) {
    return (
      <div
        ref={ref}
        id="riepilogo-errori"
        tabIndex={-1}
        role="alert"
        aria-labelledby="riepilogo-errori-titolo"
        className="mt-6 rounded-md border-2 border-error px-5 py-4"
      >
        <h2 id="riepilogo-errori-titolo" className="text-base font-semibold">
          Non è stato possibile inviare la segnalazione
        </h2>
        <p className="mt-1.5">{notice}</p>
      </div>
    );
  }
  if (fields.length === 0) return null;
  return (
    <div
      ref={ref}
      id="riepilogo-errori"
      tabIndex={-1}
      role="alert"
      aria-labelledby="riepilogo-errori-titolo"
      className="mt-6 rounded-md border-2 border-error px-5 py-4"
    >
      <h2 id="riepilogo-errori-titolo" className="text-base font-semibold">
        {fields.length === 1
          ? "Correggi 1 campo per inviare"
          : `Correggi ${fields.length} campi per inviare`}
      </h2>
      <ul className="mt-1.5 list-disc pl-5">
        {fields.map((field) => (
          <li key={field}>
            <a
              href={`#${FIELD_ID[field]}`}
              className="text-error hover:text-error"
              onClick={(event) => {
                const input = document.getElementById(FIELD_ID[field]);
                if (!input) return;
                event.preventDefault();
                input.focus();
              }}
            >
              {FIELD_LABEL[field]}: {errors[field]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
