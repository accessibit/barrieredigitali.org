"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { takeReturnFocus } from "@/lib/list-memory";

// A livello di modulo: il componente può essere rimontato dal suo <Suspense>
// durante la navigazione, ma l'ultimo percorso visto deve sopravvivere.
let previousPathname: string | null = null;

const WATCH_MS = 3000;

/**
 * Dopo una navigazione lato client sposta il focus sul titolo della pagina
 * (o sul servizio da cui si torna, nell'elenco), così chi usa tastiera o lettore
 * di schermo riparte dal nuovo contenuto. Al primo caricamento non fa nulla.
 *
 * Il nuovo contenuto può arrivare dopo il cambio di URL (streaming, prefetch):
 * per qualche secondo, se il focus si perde (finisce sul <body> perché il
 * vecchio titolo è stato rimosso), viene riportato sull'elemento giusto.
 * Qualsiasi interazione della persona interrompe l'attesa.
 */
export function RouteFocus() {
  const pathname = usePathname();

  useEffect(() => {
    if (previousPathname === null) {
      previousPathname = pathname;
      return;
    }
    if (previousPathname === pathname) return;
    previousPathname = pathname;

    // Tornando dal dettaglio il focus va sul link del servizio appena visto, non sul titolo.
    const returnTo = takeReturnFocus();
    const find = () =>
      returnTo
        ? document.getElementById(`link-${returnTo}`)
        : document.getElementById("titolo");

    let focused: HTMLElement | null = null;
    const apply = () => {
      const lost =
        !focused ||
        !focused.isConnected ||
        document.activeElement === document.body ||
        document.activeElement === null;
      if (!lost) return;
      const target = find();
      if (target && target !== focused) {
        focused = target;
        target.focus();
      } else if (target && document.activeElement !== target) {
        target.focus();
      }
    };

    const observer = new MutationObserver(apply);
    const stop = () => {
      observer.disconnect();
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", stop, true);
      window.removeEventListener("pointerdown", stop, true);
    };
    const timeout = window.setTimeout(() => {
      stop();
      if (!focused?.isConnected) {
        (
          document.getElementById("titolo") ??
          document.getElementById("contenuto")
        )?.focus();
      }
    }, WATCH_MS);

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("keydown", stop, true);
    window.addEventListener("pointerdown", stop, true);
    apply();

    return stop;
  }, [pathname]);

  return null;
}
