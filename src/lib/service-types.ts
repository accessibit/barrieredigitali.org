import type { ServiceType } from "@/generated/prisma/enums";

/** Label shown next to the service name. */
export const TYPE_LABEL: Record<ServiceType, string> = {
  WEBSITE: "Sito web",
  APP: "App",
  DOCUMENT: "Documento PDF",
  OTHER: "Altro servizio digitale",
};

/** Options of the report form, in the design's order. */
export const TYPE_OPTIONS = [
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
  value: ServiceType;
  label: string;
  hint: string;
}>;

export function typeOptionLabel(type: ServiceType): string {
  return TYPE_OPTIONS.find((o) => o.value === type)?.label ?? TYPE_LABEL[type];
}
