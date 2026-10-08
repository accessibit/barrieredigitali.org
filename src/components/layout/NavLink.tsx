import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";

import { ActiveLink } from "@/components/layout/ActiveLink";

/**
 * Link di navigazione. Nello shell statico è un link semplice; quando l'URL
 * è disponibile riceve aria-current="page" se è la pagina attuale.
 */
export function NavLink(props: {
  href: Route;
  match?: "exact" | "section";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <Link href={props.href} className={props.className}>
          {props.children}
        </Link>
      }
    >
      <ActiveLink {...props} />
    </Suspense>
  );
}
