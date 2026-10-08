"use client";

import { useEffect } from "react";

import { rememberListUrl } from "@/lib/list-memory";

/** Salva l'URL attuale dell'elenco, per il link "Tutte le segnalazioni" del dettaglio. */
export function RememberList({ url }: { url: string }) {
  useEffect(() => rememberListUrl(url), [url]);
  return null;
}
