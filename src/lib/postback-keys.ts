/**
 * Names shared by the server action, `src/proxy.ts` and the /segnala page for
 * the no-JavaScript submission flow (see `report-postback.ts`).
 */
export const POSTBACK = {
  errorsCookie: "bd_modulo",
  sentCookie: "bd_inviata",
  errorsHeader: "x-bd-postback-errors",
  sentHeader: "x-bd-postback-sent",
  path: "/segnala",
} as const;
