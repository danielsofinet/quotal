import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ["/sign-in", "/privacy", "/terms", "/api/", "/_next", "/__/auth", "/favicon"];

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

export function middleware(request: NextRequest) {
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

  // Run i18n middleware first (handles locale detection + rewriting)
  const response = intlMiddleware(request);

  // Check auth for protected paths
  if (!isPublicPath(pathname)) {
    const session = request.cookies.get("__session");
    if (!session?.value) {
      const signInUrl = new URL("/sign-in", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg|flags/|api/|sitemap\\.xml|robots\\.txt|.*\\.mp4$|.*\\.png$|.*\\.jpg$|.*\\.webp$|.*\\.svg$).*)"],
};
