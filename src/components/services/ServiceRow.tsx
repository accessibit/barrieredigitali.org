import Link from "next/link";

import { Favicon } from "@/components/services/Favicon";
import { formatDate, receivedLabel, toIsoDate } from "@/lib/format";
import { KIND_LABEL } from "@/lib/kinds";
import type { ServiceSummary } from "@/lib/services";

export function ServiceRow({
  service,
  rank,
}: {
  service: ServiceSummary;
  rank?: number;
}) {
  return (
    <li className="border-b border-line">
      <div className="row group relative -mx-3 flex items-center gap-4 rounded-[10px] px-3 py-2 hover:bg-hover narrow:-mx-2 narrow:gap-3 narrow:p-2">
        <Favicon name={service.name} slug={service.slug} />
        <div className="min-w-0 flex-auto">
          <h2 className="text-lg/[1.4] font-semibold tracking-[-0.01em] wrap-anywhere narrow:text-base/[1.4]">
            {rank !== undefined && (
              <span className="font-medium text-muted">{rank}. </span>
            )}
            <Link
              id={`link-${service.slug}`}
              href={`/segnalazioni/${service.slug}`}
              className="rowlink"
            >
              {service.name}
            </Link>{" "}
            <span className="ml-2 inline-block rounded border border-control px-1.5 align-[0.125rem] text-xs/normal font-medium text-muted narrow:mt-0.5 narrow:ml-0 narrow:align-baseline">
              {KIND_LABEL[service.kind]}
            </span>
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Ultima segnalazione:{" "}
            <time dateTime={toIsoDate(service.lastReportAt)}>
              {formatDate(service.lastReportAt)}
            </time>
          </p>
        </div>
        <p className="flex w-40 flex-none flex-col items-center rounded-[10px] bg-accent-soft px-2 py-1.5 text-center group-hover:bg-accent-soft-hover narrow:w-24 narrow:px-1">
          <b className="text-2xl/none font-bold tracking-[-0.04em] text-accent tabular-nums">
            {service.count}
          </b>
          <span className="mt-0.5 text-[0.8125rem]/tight font-medium whitespace-nowrap text-count-label narrow:text-xs narrow:whitespace-normal">
            {receivedLabel(service.count)}
          </span>
        </p>
        <svg
          className="flex-none self-center text-muted narrow:hidden"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </div>
    </li>
  );
}
