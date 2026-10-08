"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import { type ReportFormState, submitReport } from "@/app/segnala/actions";
import { Confirmation } from "@/components/report/Confirmation";
import { ErrorSummary } from "@/components/report/ErrorSummary";
import { Field } from "@/components/report/Field";
import { KIND_OPTIONS } from "@/lib/kinds";
import { FIELD_ID } from "@/lib/validation";

const BASE_TITLE = "Invia una segnalazione — Barriere Digitali";

/** Il modulo si azzera rimontandolo con una nuova chiave ("Invia un'altra segnalazione"). */
export function ReportFormContainer({ initialSite }: { initialSite: string }) {
  const [round, setRound] = useState(0);
  return (
    <ReportForm
      key={round}
      initialSite={round === 0 ? initialSite : ""}
      onReset={() => setRound((r) => r + 1)}
      isReset={round > 0}
    />
  );
}

function ReportForm({
  initialSite,
  onReset,
  isReset,
}: {
  initialSite: string;
  onReset: () => void;
  isReset: boolean;
}) {
  const initialState: ReportFormState = {
    status: "idle",
    values: { kind: "WEBSITE", site: initialSite, desc: "", email: "" },
  };
  const [state, formAction, pending] = useActionState(
    submitReport,
    initialState,
  );

  // Campi controllati: React azzera i campi non controllati dopo l'azione.
  const [kind, setKind] = useState(state.values.kind);
  const [site, setSite] = useState(state.values.site);
  const [desc, setDesc] = useState(state.values.desc);
  const [email, setEmail] = useState(state.values.email);

  const summaryRef = useRef<HTMLDivElement>(null);
  const errors = state.status === "error" ? state.errors : {};
  const submission = state.status === "error" ? state.submission : 0;

  useEffect(() => {
    if (state.status === "error") {
      document.title = `Errori nel modulo — ${BASE_TITLE}`;
      summaryRef.current?.focus();
    } else if (state.status === "sent") {
      document.title = "Segnalazione inviata — Barriere Digitali";
      window.scrollTo(0, 0);
      document.getElementById("titolo")?.focus();
    } else if (isReset) {
      document.title = BASE_TITLE;
      window.scrollTo(0, 0);
      document.getElementById("titolo")?.focus();
    }
  }, [state.status, submission, isReset]);

  if (state.status === "sent") {
    return <Confirmation recap={state.recap} onAnother={onReset} />;
  }

  const hint =
    KIND_OPTIONS.find((o) => o.value === kind)?.hint ?? KIND_OPTIONS[0].hint;

  return (
    <section className="page" aria-labelledby="titolo">
      <Link href="/" className="back">
        ← Torna alle segnalazioni
      </Link>
      <h1 id="titolo" tabIndex={-1}>
        Invia una segnalazione
      </h1>
      <p className="lead">
        Un sito, un’app, un documento o un altro servizio digitale che non sei
        riuscito a usare. Non serve un account: prima della pubblicazione la
        redazione legge ogni segnalazione e toglie eventuali dati personali.
      </p>

      <ErrorSummary ref={summaryRef} errors={errors} />

      <form
        action={formAction}
        noValidate
        onSubmit={(event) => {
          // Con JavaScript invochiamo l'azione a mano: così React non azzera il
          // modulo dopo l'invio e i valori restano dove la persona li ha lasciati.
          event.preventDefault();
          if (pending) return;
          const data = new FormData(event.currentTarget);
          startTransition(() => formAction(data));
        }}
      >
        <fieldset className="m-0 mt-6 min-w-0 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[0.9375rem] font-semibold">
            Cosa vuoi segnalare?{" "}
            <span className="font-normal text-muted">(obbligatorio)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {KIND_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-control py-1.5 pr-3.5 pl-2.5 text-[0.9375rem] hover:border-ink has-checked:border-2 has-checked:border-ink has-checked:pl-[calc(0.625rem-1px)] has-checked:font-semibold has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink"
              >
                <input
                  type="radio"
                  name="kind"
                  value={option.value}
                  checked={kind === option.value}
                  onChange={() => setKind(option.value)}
                  className="m-0 size-5 accent-ink focus-visible:shadow-none focus-visible:outline-none"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          id={FIELD_ID.site}
          label="Nome o indirizzo"
          required
          hint={hint}
          error={errors.site}
        >
          {(describedBy, invalid) => (
            <input
              id={FIELD_ID.site}
              name="site"
              type="text"
              className="input"
              autoComplete="off"
              aria-required="true"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              maxLength={300}
              value={site}
              onChange={(e) => setSite(e.target.value)}
            />
          )}
        </Field>

        <Field
          id={FIELD_ID.desc}
          label="Descrivi il problema"
          required
          hint="Cosa stavi cercando di fare e cosa te lo ha impedito? Non inserire dati personali."
          error={errors.desc}
        >
          {(describedBy, invalid) => (
            <textarea
              id={FIELD_ID.desc}
              name="desc"
              rows={5}
              className="input min-h-34 resize-y leading-normal"
              aria-required="true"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              maxLength={5000}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          )}
        </Field>

        <Field
          id={FIELD_ID.email}
          label="Email per eventuali aggiornamenti"
          required={false}
          hint="La usiamo solo per questa segnalazione e non viene pubblicata."
          error={errors.email}
        >
          {(describedBy, invalid) => (
            <input
              id={FIELD_ID.email}
              name="email"
              type="email"
              className="input"
              autoComplete="email"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>

        {/* Campo trappola per i bot: nascosto a tutti, anche ai lettori di schermo. */}
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] size-px overflow-hidden"
        >
          <label htmlFor="website_url">Lascia vuoto questo campo</label>
          <input
            id="website_url"
            name="website_url"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="btn btn-stretch"
            aria-disabled={pending || undefined}
          >
            {pending ? "Invio in corso…" : "Invia segnalazione"}
          </button>
          <Link href="/" className="btn btn-quiet btn-stretch">
            Annulla
          </Link>
        </div>
        <p className="mt-4 text-[0.9375rem] text-muted">
          Leggi{" "}
          <Link href="/come-funziona">come trattiamo le segnalazioni</Link> e l’
          <Link href="/privacy">informativa privacy</Link>.
        </p>
      </form>
    </section>
  );
}
