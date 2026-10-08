/**
 * Navigation memory between list and detail, in sessionStorage:
 * the last list URL (search, sort order, page) and the service
 * to move focus back to on return. Every access is guarded: in
 * private browsing or with storage blocked it falls back to "/".
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

/** Reads and clears the slug to move focus back to. */
export function takeReturnFocus(): string | null {
  try {
    const slug = storage()?.getItem(FOCUS_KEY) ?? null;
    storage()?.removeItem(FOCUS_KEY);
    return slug;
  } catch {
    return null;
  }
}
