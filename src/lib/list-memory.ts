/**
 * Memoria di navigazione tra elenco e dettaglio, in sessionStorage:
 * l'ultimo URL dell'elenco (ricerca, ordinamento, pagina) e il servizio
 * su cui riportare il focus al ritorno. Ogni accesso è protetto: in
 * navigazione privata o con lo storage bloccato si ripiega su "/".
 */
const LIST_KEY = "bd:elenco";
const FOCUS_KEY = "bd:ritorno";

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function rememberListUrl(url: string) {
  try {
    storage()?.setItem(LIST_KEY, url);
  } catch {}
}

export function lastListUrl(): string {
  try {
    const url = storage()?.getItem(LIST_KEY);
    return url && url.startsWith("/") && !url.startsWith("//") ? url : "/";
  } catch {
    return "/";
  }
}

export function setReturnFocus(slug: string) {
  try {
    storage()?.setItem(FOCUS_KEY, slug);
  } catch {}
}

/** Legge e cancella lo slug su cui riportare il focus. */
export function takeReturnFocus(): string | null {
  try {
    const slug = storage()?.getItem(FOCUS_KEY) ?? null;
    storage()?.removeItem(FOCUS_KEY);
    return slug;
  } catch {
    return null;
  }
}
