import type { ServiceKind } from "@/generated/prisma/enums";

/** Etichetta mostrata accanto al nome del servizio. */
export const KIND_LABEL: Record<ServiceKind, string> = {
  WEBSITE: "Sito web",
  APP: "App",
  DOCUMENT: "Documento PDF",
  OTHER: "Altro servizio digitale",
};

/** Opzioni del modulo di segnalazione, nell'ordine del design. */
export const KIND_OPTIONS = [
  {
    value: "WEBSITE",
    label: "Sito web",
    hint: "Ad esempio comune.milano.it o l’indirizzo della pagina.",
  },
  {
    value: "APP",
    label: "App",
    hint: "Il nome dell’app, e se lo sai il sistema (iPhone o Android).",
  },
  {
    value: "DOCUMENT",
    label: "Documento o PDF",
    hint: "Il nome del documento e chi lo ha pubblicato.",
  },
  {
    value: "OTHER",
    label: "Altro servizio digitale",
    hint: "Il nome del servizio, ad esempio un totem o uno sportello digitale.",
  },
] as const satisfies ReadonlyArray<{
  value: ServiceKind;
  label: string;
  hint: string;
}>;

export function kindOptionLabel(kind: ServiceKind): string {
  return KIND_OPTIONS.find((o) => o.value === kind)?.label ?? KIND_LABEL[kind];
}
