import type { Metadata } from "next";

import { EmailOrPlaceholder, Placeholder } from "@/components/ui/Placeholder";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contatto stampa" };

export default function PressPage() {
  return (
    <>
      <h1 id="titolo" tabIndex={-1}>
        Contatto stampa
      </h1>
      <p className="lead">
        Per richieste di dati, interviste o verifiche sulle segnalazioni
        pubblicate.
      </p>
      <h2>Contatti</h2>
      <p>
        Email:{" "}
        <EmailOrPlaceholder value={SITE.pressEmail} label="EMAIL STAMPA" />
      </p>
      <p>
        Telefono: <Placeholder value={SITE.pressPhone} label="TELEFONO" />
      </p>
      <h2>Prima di citare una segnalazione</h2>
      <p>
        Ogni segnalazione è un’esperienza personale verificata dalla redazione,
        non una valutazione tecnica del servizio. Citala con la sua data.
      </p>
    </>
  );
}
