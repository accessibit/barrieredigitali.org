"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    console.error(error);
  }, [error]);
  useEffect(() => {
    document.title = "Si è verificato un errore — Barriere Digitali";
    heading.current?.focus();
  }, []);
  return (
    <div className="wrap">
      <section className="page" aria-labelledby="titolo">
        <h1 id="titolo" ref={heading} tabIndex={-1}>
          Si è verificato un errore
        </h1>
        <p className="lead">
          Non siamo riusciti a caricare la pagina. Riprova tra qualche istante.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn btn-stretch"
            onClick={() => retry()}
          >
            Riprova
          </button>
          <Link href="/" className="btn btn-quiet btn-stretch">
            Vai alle segnalazioni
          </Link>
        </div>
      </section>
    </div>
  );
}
