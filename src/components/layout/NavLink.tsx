import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";

import { ActiveLink } from "@/components/layout/ActiveLink";

/**
 * Navigation link. In the static shell it is a plain link; once the URL
 * is available it gets aria-current="page" if it is the current page.
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
