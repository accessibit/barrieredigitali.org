import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackToList } from "@/components/services/BackToList";
import { Favicon } from "@/components/services/Favicon";
import { FocusOnChange } from "@/components/services/FocusOnChange";
import { Pager } from "@/components/services/Pager";
import { formatDate, plural, receivedLabel, toIsoDate } from "@/lib/format";
import { TYPE_LABEL } from "@/lib/service-types";
import { last } from "@/lib/search-params";
import { getService, getServiceReports } from "@/lib/services";
import { REPORTS_PER_PAGE } from "@/lib/site";

type Props = PageProps<"/segnalazioni/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Pagina non trovata" };
  return {
    title: `${service.name} — segnalazioni`,
    description: `${plural(service.count, "segnalazione pubblicata", "segnalazioni pubblicate")} su ${service.name}, verificate dalla redazione di Barriere Digitali.`,
    alternates: { canonical: `/segnalazioni/${service.slug}` },
  };
}

/**
 * "Blocking" page: the server sends the complete HTML, with no streamed
 * content. This way the list, search and form also work without JavaScript
 * and there is no layout shift while loading.
 */
export const instant = false;

export default function ServicePage({ params, searchParams }: Props) {
  return (
    <div className="wrap">
      <ServiceDetail params={params} searchParams={searchParams} />
    </div>
  );
}

async function ServiceDetail({
  params,
  searchParams,
}: Pick<Props, "params" | "searchParams">) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const requested = Math.max(
    1,
    Number.parseInt(last((await searchParams).pagina), 10) || 1,
  );
  const { reports, page, pages, start } = await getServiceReports(
    service.id,
    requested,
    service.count,
  );
  const pageHref = (p: number) =>
    p > 1
      ? `/segnalazioni/${service.slug}?pagina=${p}`
      : `/segnalazioni/${service.slug}`;

  return (
    <article className="page max-w-none">
      <BackToList slug={service.slug} />
      <div className="mt-3 flex items-center gap-4 narrow:flex-wrap">
        <Favicon name={service.name} slug={service.slug} size="lg" />
        <div className="min-w-0 flex-auto narrow:basis-40">
          <h1 id="titolo" tabIndex={-1} className="mt-0!">
            {service.name}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {TYPE_LABEL[service.type]} · Ultima segnalazione:{" "}
            <time dateTime={toIsoDate(service.lastReportAt)}>
              {formatDate(service.lastReportAt)}
            </time>
          </p>
        </div>
        <p className="flex w-36 flex-none flex-col items-center rounded-[10px] border border-control bg-white px-2 py-3.5 text-center narrow:w-full narrow:flex-row narrow:items-baseline narrow:justify-center narrow:gap-2 narrow:px-4 narrow:py-3">
          <b className="text-[2rem]/none font-bold tracking-[-0.03em] text-accent tabular-nums narrow:text-[2.75rem]/none">
            {service.count}
          </b>
          <span className="mt-0.5 text-[0.8125rem]/tight font-medium text-muted narrow:text-[0.9375rem]">
            {receivedLabel(service.count)}
          </span>
        </p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link
          href={
            `/segnala?servizio=${encodeURIComponent(service.name)}` as Route
          }
          className="btn btn-stretch"
        >
          Segnala un problema su {service.name}
        </Link>
      </div>
      <h2
        id="elenco-segnalazioni"
        tabIndex={-1}
        className="mt-9 border-b border-ink pb-2 text-base font-semibold"
      >
        Segnalazioni, dalla più recente
        {pages > 1 && (
          <span className="font-normal text-muted">
            {" "}
            · {start + 1}–{Math.min(start + REPORTS_PER_PAGE, service.count)} di{" "}
            {service.count}
          </span>
        )}
      </h2>
      <FocusOnChange value={String(page)} targetId="elenco-segnalazioni" />
      <ol className="m-0 list-none p-0">
        {reports.map((report) => (
          <li
            key={report.id}
            className="grid grid-cols-[8rem_minmax(0,1fr)] gap-x-6 gap-y-0.5 border-b border-line py-3.5 narrow:grid-cols-1"
          >
            <time
              dateTime={toIsoDate(report.publishedAt)}
              className="pt-0.5 text-sm text-muted"
            >
              {formatDate(report.publishedAt)}
            </time>
            <p className="max-w-[64ch] leading-[1.55] whitespace-pre-line">
              {report.description}
            </p>
          </li>
        ))}
      </ol>
      {pages > 1 && (
        <Pager
          label="Pagine delle segnalazioni"
          summary={`Pagina ${page} di ${pages}`}
          page={page}
          pages={pages}
          href={pageHref}
        />
      )}
    </article>
  );
}
