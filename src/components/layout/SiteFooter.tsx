import { NavLink } from "@/components/layout/NavLink";

const link =
  "inline-flex min-h-11 items-center text-ink hover:text-ink aria-[current=page]:font-bold";

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-line pt-4 pb-8 text-sm narrow:mt-10">
        <nav aria-label="Informazioni">
          <ul className="m-0 flex list-none flex-wrap gap-x-6 p-0 narrow:flex-col narrow:gap-0">
            <li>
              <NavLink href="/come-funziona" className={link}>
                Come trattiamo le segnalazioni
              </NavLink>
            </li>
            <li>
              <NavLink href="/stampa" className={link}>
                Contatto stampa
              </NavLink>
            </li>
            <li>
              <NavLink href="/privacy" className={link}>
                Privacy
              </NavLink>
            </li>
          </ul>
        </nav>
        <p className="text-muted">
          I numeri contano le segnalazioni ricevute, non misurano
          l’accessibilità.
        </p>
      </div>
    </footer>
  );
}
