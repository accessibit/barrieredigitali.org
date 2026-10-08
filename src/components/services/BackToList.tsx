"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import { lastListUrl, setReturnFocus } from "@/lib/list-memory";

/**
 * Torna all'elenco nello stato in cui lo si era lasciato (ricerca,
 * ordinamento, pagina) e riporta il focus sul servizio appena visto.
 */
export function BackToList({ slug }: { slug: string }) {
  const [href, setHref] = useState("/");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage esiste solo nel browser
  useEffect(() => setHref(lastListUrl()), []);
  return (
    <Link
      href={href as Route}
      className="back"
      onClick={() => setReturnFocus(slug)}
    >
      ← Tutte le segnalazioni
    </Link>
  );
}
