import type { Metadata } from "next";

import { Placeholder } from "@/components/ui/Placeholder";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Chi siamo" };

export default function AboutPage() {
  return (
    <>
      <h1 id="titolo" tabIndex={-1}>
        Chi siamo
      </h1>
      <p className="lead">
        Barriere Digitali raccoglie le esperienze di chi incontra ostacoli
        usando siti, app e documenti digitali, e le rende consultabili da
        giornalisti e cittadini.
      </p>
      <h2>Chi promuove il progetto</h2>
      <p>
        <Placeholder
          value={SITE.organization}
          label="NOME DELL'ORGANIZZAZIONE E BREVE DESCRIZIONE"
        />
      </p>
      <h2>Cosa non facciamo</h2>
      <ul>
        <li>Non assegniamo punteggi di accessibilità.</li>
        <li>Non certifichiamo la conformità dei servizi alle norme.</li>
      </ul>
    </>
  );
}
