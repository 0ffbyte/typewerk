import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BASE_DOMAIN = "localhost:3000";
const SUBDOMAIN_RE = /^[a-z0-9-]{1,63}$/;

function extractSubdomain(host: string): string | null {
  if (!host) return null;

  const hostParts = host.split(".");

  // Need at least 2 parts for a subdomain
  if (hostParts.length < 2) return null;

  let subdomain = hostParts[0] || null;

  // Skip 'www' subdomain
  if (subdomain === "www") {
    subdomain = hostParts.length >= 3 ? hostParts[1] : null;
  }

  return subdomain;
}

function createSubdomainUrl(request: NextRequest, subdomain: string): URL {
  const url = request.nextUrl.clone();
  const pathname = url.pathname === "/" ? "" : url.pathname;
  url.pathname = `/${subdomain}${pathname}`;
  return url;
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const sub = extractSubdomain(host);

  // If no subdomain found, continue with original request
  if (!sub) return NextResponse.next();

  // Rewrite to the subdomain route
  const rewrittenUrl = createSubdomainUrl(request, sub);
  return NextResponse.rewrite(rewrittenUrl);
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|[\\w-]+\\.\\w+).*)",
  ],
};
