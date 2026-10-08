"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import { lastListUrl, setReturnFocus } from "@/lib/list-memory";

/**
 * Goes back to the list in the state it was left in (search,
 * sort order, page) and moves focus back to the service just viewed.
 */
export function BackToList({ slug }: { slug: string }) {
  const [href, setHref] = useState("/");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage only exists in the browser
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
