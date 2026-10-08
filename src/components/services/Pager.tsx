import type { Route } from "next";
import Link from "next/link";

import { pageWindow } from "@/lib/search-params";

const box =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-control px-3 font-medium text-ink no-underline tabular-nums hover:border-ink hover:bg-paper hover:text-ink";

/** Pagination with real links: also works without JavaScript. */
export function Pager({
  label,
  summary,
  page,
  pages,
  href,
}: {
  label: string;
  summary: string;
  page: number;
  pages: number;
  href: (page: number) => string;
}) {
  const to = (p: number) => href(p) as Route;
  return (
    <nav
      aria-label={label}
      className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 narrow:justify-center"
    >
      <p className="text-sm text-muted narrow:basis-full narrow:text-center">
        {summary}
      </p>
      <ul className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
        {page > 1 && (
          <li>
            <Link
              href={to(page - 1)}
              scroll={false}
              className={`${box} narrow:px-2.5`}
            >
              ← Precedente
            </Link>
          </li>
        )}
        {pageWindow(page, pages).map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true">
              <span className="inline-flex min-w-6 items-center justify-center text-muted">
                …
              </span>
            </li>
          ) : (
            <li key={n}>
              <Link
                href={to(n)}
                scroll={false}
                aria-label={
                  n === page ? `Pagina ${n}, pagina attuale` : `Pagina ${n}`
                }
                aria-current={n === page ? "page" : undefined}
                className={`${box} aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:font-bold aria-[current=page]:text-white`}
              >
                {n}
              </Link>
            </li>
          ),
        )}
        {page < pages && (
          <li>
            <Link
              href={to(page + 1)}
              scroll={false}
              className={`${box} narrow:px-2.5`}
            >
              Successiva →
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
