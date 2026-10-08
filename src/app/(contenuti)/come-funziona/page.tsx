import type { Metadata } from "next";

import { EmailOrPlaceholder } from "@/components/ui/Placeholder";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Come trattiamo le segnalazioni" };

export default function MethodPage() {
  return (
    <>
      <h1 id="titolo" tabIndex={-1}>
        Come trattiamo le segnalazioni
      </h1>
      <p className="lead">
        Ogni segnalazione è l’esperienza di una persona. Prima di pubblicarla la
        leggiamo e la verifichiamo.
      </p>
      <h2>Dalla ricezione alla pubblicazione</h2>
      <ol>
        <li>
          <strong>Ricezione.</strong> Chiunque può inviare una segnalazione,
          senza account.
        </li>
        <li>
          <strong>Verifica.</strong> La redazione controlla che descriva un
          ostacolo concreto e toglie nomi, numeri e altri dati personali.
        </li>
        <li>
          <strong>Pubblicazione.</strong> Pubblichiamo il testo, la data e il
          servizio segnalato. L’email non viene mai pubblicata.
        </li>
      </ol>
      <h2>Cosa indicano i numeri</h2>
      <p>
        Il numero accanto a ogni servizio conta le segnalazioni pubblicate. Non
        è un punteggio e non certifica la conformità alle norme
        sull’accessibilità.
      </p>
      <h2>Se gestisci un servizio segnalato</h2>
      <p>
        Puoi scriverci a{" "}
        <EmailOrPlaceholder
          value={SITE.editorialEmail}
          label="EMAIL REDAZIONE"
        />{" "}
        per segnalare una correzione o un problema risolto.
      </p>
    </>
  );
}
