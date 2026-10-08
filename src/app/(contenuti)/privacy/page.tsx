import type { Metadata } from "next";

import { EmailOrPlaceholder, Placeholder } from "@/components/ui/Placeholder";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <h1 id="titolo" tabIndex={-1}>
        Privacy
      </h1>
      <p className="lead">
        Quali dati raccogliamo quando invii una segnalazione e come li usiamo.
      </p>
      <h2>Dati raccolti</h2>
      <ul>
        <li>
          Il tipo di servizio, il suo nome o indirizzo e la descrizione del
          problema.
        </li>
        <li>L’email, solo se scegli di lasciarla.</li>
        <li>
          Un’impronta cifrata dell’indirizzo IP, che cambia ogni giorno e serve
          solo a limitare gli invii ripetuti. L’indirizzo IP non viene salvato.
        </li>
      </ul>
      <h2>Titolare e conservazione</h2>
      <p>
        Titolare del trattamento:{" "}
        <Placeholder value={SITE.dataController} label="TITOLARE" />. Periodo di
        conservazione dell’email:{" "}
        <Placeholder value={SITE.emailRetention} label="PERIODO" />.
      </p>
      <h2>I tuoi diritti</h2>
      <p>
        Per accedere ai tuoi dati, correggerli o cancellarli scrivi a{" "}
        <EmailOrPlaceholder value={SITE.privacyEmail} label="EMAIL PRIVACY" />.
      </p>
    </>
  );
}
