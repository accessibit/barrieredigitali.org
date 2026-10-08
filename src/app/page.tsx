import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FocusOnChange } from "@/components/services/FocusOnChange";
import { Pager } from "@/components/services/Pager";
import { SearchTools } from "@/components/services/SearchTools";
import { ServiceRow } from "@/components/services/ServiceRow";
import { plural } from "@/lib/format";
import { listHref, parseListParams } from "@/lib/search-params";
import { listServices } from "@/lib/services";
import { PER_PAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Segnalazioni — Barriere Digitali" },
};

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <div className="wrap pt-7 narrow:pt-4.5">
      <h1
        id="titolo"
        tabIndex={-1}
        className="max-w-[32ch] text-2xl/tight font-bold tracking-[-0.025em] narrow:text-xl/tight"
      >
        Le barriere del web, segnalate da chi le incontra.
      </h1>
      <Suspense fallback={<ListFallback />}>
        <ServiceListing searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function ListFallback() {
  return (
    <p role="status" className="mt-6 text-muted">
      Caricamento delle segnalazioni…
    </p>
  );
}

async function ServiceListing({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const {
    query,
    sort,
    page: requested,
    from,
  } = parseListParams(await searchParams);
  const { items, total, page, pages, start } = await listServices({
    query,
    sort,
    page: requested,
  });

  const status =
    total === 0
      ? "Nessun risultato"
      : `${plural(total, "risultato", "risultati")}, ordinati ${
          sort === "count"
            ? "dal più segnalato"
            : "dalla segnalazione più recente"
        }`;

  return (
    <>
      <SearchTools query={query} sort={sort} />

      <div
        id="risultati"
        tabIndex={-1}
        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-2.5 text-sm"
      >
        <p role="status" className="font-semibold">
          {status}
        </p>
      </div>
      <FocusOnChange value={String(page)} targetId="risultati" />

      {total > 0 ? (
        <>
          <ul
            aria-label="Servizi segnalati"
            className="m-0 list-none border-t border-ink p-0"
          >
            {items.map((service, i) => (
              <ServiceRow
                key={service.id}
                service={service}
                rank={sort === "count" ? start + i + 1 : undefined}
                focusOnArrival={service.slug === from}
              />
            ))}
          </ul>
          {pages > 1 && (
            <Pager
              page={page}
              pages={pages}
              total={total}
              start={start}
              perPage={PER_PAGE}
              query={query}
              sort={sort}
            />
          )}
          <p className="note mt-3">
            Il numero conta le segnalazioni ricevute e pubblicate: non misura
            l’accessibilità del servizio.
          </p>
        </>
      ) : !query.trim() ? (
        <div className="border-t border-ink pt-8 pb-10">
          <h2 className="text-xl font-semibold tracking-[-0.015em]">
            Non ci sono ancora segnalazioni pubblicate
          </h2>
          <p className="mt-2 max-w-[52ch] text-muted">
            Hai incontrato una barriera in un sito, un’app o un documento? Sii
            il primo a segnalarla.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/segnala" className="btn btn-stretch">
              Invia una segnalazione
            </Link>
          </div>
        </div>
      ) : (
        <div className="border-t border-ink pt-8 pb-10">
          <h2 className="text-xl font-semibold tracking-[-0.015em] wrap-anywhere">
            Nessun risultato per “{query}”
          </h2>
          <p className="mt-2 max-w-[52ch] text-muted">
            Nessuno lo ha ancora segnalato, oppure il nome è scritto in modo
            diverso. Prova con una parte del nome, senza “www” o “https://”.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={
                `/segnala?servizio=${encodeURIComponent(query.trim())}` as Route
              }
              className="btn btn-stretch"
            >
              Segnala “{query}”
            </Link>
            <Link
              href={listHref({ sort }) as Route}
              className="btn btn-quiet btn-stretch"
            >
              Mostra tutte le segnalazioni
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
