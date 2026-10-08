import type { ReactNode } from "react";

/** Etichetta, suggerimento ed eventuale errore di un campo del modulo. */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required: boolean;
  hint: string;
  error?: string;
  children: (describedBy: string, invalid: boolean) => ReactNode;
}) {
  const describedBy = error
    ? `${id}-errore ${id}-suggerimento`
    : `${id}-suggerimento`;
  return (
    <div className="mt-6">
      <label className="label" htmlFor={id}>
        {label}{" "}
        <span className="font-normal text-muted">
          {required ? "(obbligatorio)" : "(facoltativa)"}
        </span>
      </label>
      <span className="hint" id={`${id}-suggerimento`}>
        {hint}
      </span>
      {error && (
        <p
          className="mb-1.5 text-[0.9375rem] font-semibold text-error"
          id={`${id}-errore`}
        >
          Errore: {error}
        </p>
      )}
      {children(describedBy, Boolean(error))}
    </div>
  );
}
