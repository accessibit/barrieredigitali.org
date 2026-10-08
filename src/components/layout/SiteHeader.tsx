import Link from "next/link";

import { NavLink } from "@/components/layout/NavLink";
import { SITE } from "@/lib/site";

const navLink =
  "inline-flex min-h-11 items-center px-0.5 text-[0.9375rem] font-medium whitespace-nowrap text-ink no-underline hover:text-ink hover:underline aria-[current=page]:font-bold aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[0.35em]";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-header flex-wrap items-center gap-x-8 gap-y-2 px-10 py-3 narrow:justify-between narrow:gap-x-4 narrow:gap-y-1 narrow:px-4 narrow:pt-2.5 narrow:pb-0">
        <Link
          href="/"
          className="inline-flex min-h-11 flex-none items-center text-lg/[1.3] font-bold tracking-[-0.02em] whitespace-nowrap text-ink no-underline hover:text-ink hover:underline"
        >
          {SITE.name}
        </Link>
        <nav
          aria-label="Principale"
          className="min-w-0 flex-auto narrow:order-3 narrow:-mx-4 narrow:mt-1 narrow:basis-full narrow:border-t narrow:border-line narrow:px-4"
        >
          <ul className="m-0 flex list-none flex-wrap justify-end gap-x-7 p-0 narrow:justify-start narrow:gap-x-6">
            <li>
              <NavLink href="/" match="section" className={navLink}>
                Segnalazioni
              </NavLink>
            </li>
            <li>
              <NavLink href="/come-funziona" className={navLink}>
                Come funziona
              </NavLink>
            </li>
          </ul>
        </nav>
        <NavLink
          href="/segnala"
          className="btn btn-cta flex-none whitespace-nowrap"
        >
          Invia una segnalazione
        </NavLink>
      </div>
    </header>
  );
}
