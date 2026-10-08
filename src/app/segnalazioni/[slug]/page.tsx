import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Favicon } from "@/components/services/Favicon";
import { formatDate, plural, toIsoDate } from "@/lib/format";
import { KIND_LABEL } from "@/lib/kinds";
import { getService } from "@/lib/services";

export async function generateMetadata({
  params,
}: PageProps<"/segnalazioni/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Pagina non trovata" };
  return {
    title: `${service.name} — segnalazioni`,
    description: `${plural(service.count, "segnalazione pubblicata", "segnalazioni pubblicate")} su ${service.name}.`,
  };
}

export default function ServicePage({
  params,
}: PageProps<"/segnalazioni/[slug]">) {
  return (
    <div className="wrap">
      <Suspense
        fallback={
          <p role="status" className="mt-6 text-muted">
            Caricamento delle segnalazioni…
          </p>
        }
      >
        <ServiceDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ServiceDetail({
  params,
}: {
  params: PageProps<"/segnalazioni/[slug]">["params"];
}) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  return (
    <article className="page max-w-none">
      <Link
        href={`/?da=${encodeURIComponent(service.slug)}` as Route}
        className="back"
      >
        ← Tutte le segnalazioni
      </Link>
      <div className="mt-3 flex items-center gap-4 narrow:flex-wrap">
        <Favicon name={service.name} slug={service.slug} size="lg" />
        <div className="min-w-0 flex-auto narrow:basis-40">
          <h1 id="titolo" tabIndex={-1} className="mt-0!">
            {service.name}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {KIND_LABEL[service.kind]} · Ultima segnalazione:{" "}
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
            segnalazioni ricevute
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
      <h2 className="mt-9 border-b border-ink pb-2 text-base font-semibold">
        Segnalazioni, dalla più recente
      </h2>
      <ol className="m-0 list-none p-0">
        {service.reports.map((report) => (
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
    </article>
  );
}
