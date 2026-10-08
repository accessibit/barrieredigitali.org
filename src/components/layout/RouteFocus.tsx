"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { takeReturnFocus } from "@/lib/list-memory";

// Module-level: the component may be remounted by its <Suspense>
// during navigation, but the last seen path must survive.
let previousPathname: string | null = null;

const WATCH_MS = 3000;

/**
 * After a client-side navigation, moves focus to the page heading
 * (or, in the list, to the service being returned from), so keyboard and screen
 * reader users start again from the new content. Does nothing on first load.
 *
 * The new content may arrive after the URL change (streaming, prefetch):
 * for a few seconds, if focus is lost (it lands on <body> because the
 * old heading was removed), it is moved back to the right element.
 * Any user interaction stops the wait.
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

    // When returning from the detail page, focus goes to the link of the service just viewed, not to the heading.
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
