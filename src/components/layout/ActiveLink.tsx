"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Link with aria-current="page" when it matches the current page (reads the URL). */
export function ActiveLink({
  href,
  match = "exact",
  className,
  children,
}: {
  href: Route;
  match?: "exact" | "section";
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const current =
    match === "section" && href === "/"
      ? pathname === "/" || pathname.startsWith("/segnalazioni")
      : pathname === href;
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}
