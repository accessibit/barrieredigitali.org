import type { Metadata } from "next";
import { Suspense } from "react";

import { ReportFormContainer } from "@/components/report/ReportForm";
import { last } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Invia una segnalazione",
  description:
    "Segnala un sito, un’app, un documento o un altro servizio digitale che non sei riuscito a usare. Non serve un account.",
};

export default function ReportPage({ searchParams }: PageProps<"/segnala">) {
  return (
    <div className="wrap">
      <Suspense fallback={null}>
        <Prefilled searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Prefilled({
  searchParams,
}: {
  searchParams: PageProps<"/segnala">["searchParams"];
}) {
  const site = last((await searchParams).servizio).slice(0, 300);
  return <ReportFormContainer initialSite={site} />;
}
