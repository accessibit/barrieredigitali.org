import type { Metadata } from "next";

import { ReportFormContainer } from "@/components/report/ReportForm";
import { readPostback } from "@/lib/report-postback";
import { last } from "@/lib/search-params";

const description =
  "Segnala un sito, un’app, un documento o un altro servizio digitale che non sei riuscito a usare. Non serve un account.";

export async function generateMetadata(): Promise<Metadata> {
  // Dopo un invio senza JavaScript il titolo riflette l'esito, come fa il client.
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
 * Pagina "bloccante": il server invia l'HTML completo, senza contenuti in
 * streaming. Così elenco, ricerca e modulo funzionano anche senza JavaScript
 * e non c'è salto di layout durante il caricamento.
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
