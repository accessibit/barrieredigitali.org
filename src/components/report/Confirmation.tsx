import Link from "next/link";

import type { ReportFormState } from "@/app/segnala/actions";

type Recap = Extract<ReportFormState, { status: "sent" }>["recap"];

export function Confirmation({
  recap,
  onAnother,
}: {
  recap: Recap;
  onAnother: () => void;
}) {
  return (
    <section className="page" aria-labelledby="titolo">
      <p className="mt-4 text-[0.9375rem] font-semibold text-ok">
        Segnalazione inviata
      </p>
      <h1 id="titolo" tabIndex={-1} className="mt-1!">
        Grazie, l’abbiamo ricevuta.
      </h1>
      <p className="lead">
        Prima della pubblicazione la redazione la legge e la verifica, quindi
        non comparirà subito nell’elenco.
      </p>
      {recap.email && (
        <p className="lead">
          Ti scriveremo a {recap.email} quando sarà pubblicata.
        </p>
      )}
      <dl className="mt-6 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-t border-line pt-4 text-[0.9375rem] narrow:grid-cols-1 narrow:gap-0">
        <dt className="text-muted">Tipo</dt>
        <dd className="wrap-anywhere narrow:mb-2">{recap.kindLabel}</dd>
        <dt className="text-muted">Nome o indirizzo</dt>
        <dd className="wrap-anywhere narrow:mb-2">{recap.site}</dd>
        <dt className="text-muted">Problema</dt>
        <dd className="wrap-anywhere whitespace-pre-line narrow:mb-2">
          {recap.desc}
        </dd>
      </dl>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href="/" className="btn btn-stretch">
          Torna alle segnalazioni
        </Link>
        <Link
          href="/segnala"
          className="btn btn-quiet btn-stretch"
          onClick={(event) => {
            event.preventDefault();
            onAnother();
          }}
        >
          Invia un’altra segnalazione
        </Link>
      </div>
    </section>
  );
}
