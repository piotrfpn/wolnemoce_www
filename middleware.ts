import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPrefixes = ["/panel", "/admin"];

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
}

function copySafeResponseHeaders(source: NextResponse, target: NextResponse) {
  source.headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (
      normalizedKey === "set-cookie" ||
      normalizedKey === "content-length" ||
      normalizedKey === "content-encoding" ||
      normalizedKey === "transfer-encoding" ||
      normalizedKey === "connection"
    ) {
      return;
    }

    target.headers.set(key, value);
  });
}

function copySupabaseResponse(source: NextResponse, target: NextResponse) {
  copyResponseCookies(source, target);
  copySafeResponseHeaders(source, target);

  return target;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/auth/callback") {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const encodedNextPath = encodeURIComponent(nextPath);
    redirectUrl.pathname = "/logowanie";
    redirectUrl.search = `?next=${encodedNextPath}&return_to=${encodedNextPath}`;
    return copySupabaseResponse(response, NextResponse.redirect(redirectUrl));
  }

  if (pathname === "/pl" || pathname === "/pl/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return copySupabaseResponse(
      response,
      NextResponse.redirect(redirectUrl, 308)
    );
  }

  const localizedPublicRoutes = [
    "/jak-to-dziala",
    "/cennik",
    "/kontakt",
    "/regulamin",
    "/polityka-prywatnosci",
    "/polityka-cookies",
    "/blog",
    "/firmy",
    "/oferty",
    "/zapytania",
    "/dodaj-zapytanie",
    "/zapytanie-wyslane",
    "/zapytanie-ofertowe",
  ];

  const localizedAuthRoutes = ["/logowanie", "/rejestracja"];
  const plLocalizedRoute = [...localizedPublicRoutes, ...localizedAuthRoutes].find(
    (route) => pathname === `/pl${route}`
  );
  if (plLocalizedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = plLocalizedRoute;
    return copySupabaseResponse(
      response,
      NextResponse.redirect(redirectUrl, 308)
    );
  }

  const localizedPublicPrefixes = [
    "/blog/",
    "/firmy/",
    "/oferty/",
    "/zapytania/",
  ];

  const plMarketingPrefix = localizedPublicPrefixes.find((prefix) => pathname.startsWith(`/pl${prefix}`));
  if (plMarketingPrefix) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/pl/, "");
    return copySupabaseResponse(
      response,
      NextResponse.redirect(redirectUrl, 308)
    );
  }

  if (pathname === "/") {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/pl";
    return copySupabaseResponse(response, NextResponse.rewrite(rewriteUrl));
  }

  if (localizedPublicRoutes.includes(pathname)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/pl${pathname}`;
    return copySupabaseResponse(response, NextResponse.rewrite(rewriteUrl));
  }

  const marketingPrefix = localizedPublicPrefixes.find((prefix) => pathname.startsWith(prefix));
  if (marketingPrefix) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/pl${pathname}`;
    return copySupabaseResponse(response, NextResponse.rewrite(rewriteUrl));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
