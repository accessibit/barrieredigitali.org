import type { Metadata } from "next";

import { ReportFormContainer } from "@/components/report/ReportForm";
import { readPostback } from "@/lib/report-postback";
import { last } from "@/lib/search-params";

const description =
  "Segnala un sito, un’app, un documento o un altro servizio digitale che non sei riuscito a usare. Non serve un account.";

export async function generateMetadata(): Promise<Metadata> {
  // After a submission without JavaScript the title reflects the outcome, as the client does.
  const postback = await readPostback();
  const title =
    postback?.status === "sent"
      ? "Segnalazione inviata"
      : postback?.status === "error"
        ? "Errori nel modulo — Invia una segnalazione"
        : "Invia una segnalazione";
  return { title, description };
}

/**
 * "Blocking" page: the server sends the complete HTML, with no streamed
 * content. This way the list, search and form also work without JavaScript
 * and there is no layout shift while loading.
 */
export const instant = false;

export default function ReportPage({ searchParams }: PageProps<"/segnala">) {
  return (
    <div className="wrap">
      <Prefilled searchParams={searchParams} />
    </div>
  );
}

async function Prefilled({
  searchParams,
}: {
  searchParams: PageProps<"/segnala">["searchParams"];
}) {
  const site = last((await searchParams).servizio).slice(0, 300);
  const postback = await readPostback();
  return <ReportFormContainer initialSite={site} postback={postback} />;
}
