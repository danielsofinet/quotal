import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ["/sign-in", "/privacy", "/terms", "/blog", "/api/", "/_next", "/__/auth", "/favicon"];

function isPublicPath(pathname: string): boolean {
  // Root path is public (landing page)
  if (pathname === "/") return true;

  // Check locale-prefixed root (e.g. /sv, /de)
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return true;
  }

  // Check public paths (with or without locale prefix)
  const strippedPathname = stripLocalePrefix(pathname);
  return PUBLIC_PATHS.some((p) => strippedPathname.startsWith(p));
}

function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return pathname;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware entirely for static files, Next internals, API routes,
  // and SEO files (sitemap, robots)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/__/auth") ||
    pathname.startsWith("/favicon") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // Run i18n middleware (handles locale detection + rewriting)
  const response = intlMiddleware(request);

  // Preserve original request cookies through the intl middleware response.
  // intlMiddleware uses x-middleware-override-headers to set NEXT_LOCALE,
  // which can overwrite the original cookie header and strip __session.
  const originalCookies = request.headers.get("cookie") || "";
  const middlewareCookie =
    response.headers.get("x-middleware-request-cookie") || "";

  // Merge: start with original cookies, append any middleware-added ones
  const mergedCookies = originalCookies
    ? middlewareCookie
      ? `${originalCookies}; ${middlewareCookie}`
      : originalCookies
    : middlewareCookie;

  // Ensure "cookie" is in the override list
  const overrides =
    response.headers.get("x-middleware-override-headers") || "";
  const overrideSet = new Set(
    overrides
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean),
  );
  overrideSet.add("cookie");
  response.headers.set(
    "x-middleware-override-headers",
    Array.from(overrideSet).join(","),
  );
  response.headers.set("x-middleware-request-cookie", mergedCookies);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg|flags/|api/|sitemap\\.xml|robots\\.txt|.*\\.mp4$|.*\\.png$|.*\\.jpg$|.*\\.webp$|.*\\.svg$).*)"],
};
