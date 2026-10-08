import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pagina non trovata" };

export default function NotFound() {
  return (
    <div className="wrap">
      <section className="page" aria-labelledby="titolo">
        <h1 id="titolo" tabIndex={-1}>
          Pagina non trovata
        </h1>
        <p className="lead">
          L’indirizzo potrebbe essere sbagliato, oppure la pagina non esiste
          più.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/" className="btn btn-stretch">
            Vai alle segnalazioni
          </Link>
        </div>
      </section>
    </div>
  );
}
