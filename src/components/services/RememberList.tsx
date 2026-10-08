"use client";

import { useEffect } from "react";

import { rememberListUrl } from "@/lib/list-memory";

/** Saves the current list URL, for the "Tutte le segnalazioni" link on the detail page. */
export function RememberList({ url }: { url: string }) {
  useEffect(() => rememberListUrl(url), [url]);
  return null;
}
