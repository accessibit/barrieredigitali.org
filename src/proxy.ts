import { type NextRequest, NextResponse } from "next/server";

import { POSTBACK } from "@/lib/postback-keys";

/**
 * Makes the no-JavaScript submission outcome readable exactly once.
 *
 * Cookies cannot be deleted while rendering a page, so on GET /segnala the
 * proxy moves the postback cookies into request headers (read by the page)
 * and deletes them in the response: a refresh or the next visitor on a shared
 * device starts from an empty form. Client-supplied copies of those headers
 * are always discarded.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete(POSTBACK.errorsHeader);
  headers.delete(POSTBACK.sentHeader);

  if (request.method !== "GET") {
    return NextResponse.next({ request: { headers } });
  }

  const errors = request.cookies.get(POSTBACK.errorsCookie)?.value;
  const sent = request.cookies.get(POSTBACK.sentCookie)?.value;
  // Header values must be ASCII: the payload contains characters such as "’".
  if (errors) headers.set(POSTBACK.errorsHeader, encodeURIComponent(errors));
  if (sent) headers.set(POSTBACK.sentHeader, encodeURIComponent(sent));

  const response = NextResponse.next({ request: { headers } });
  if (errors)
    response.cookies.delete({
      name: POSTBACK.errorsCookie,
      path: POSTBACK.path,
    });
  if (sent)
    response.cookies.delete({ name: POSTBACK.sentCookie, path: POSTBACK.path });
  return response;
}

export const config = {
  matcher: "/segnala",
};
