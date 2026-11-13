import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, detectLocaleFromAcceptLanguage, localePrefix, readLocaleCookie, stripLocaleFromPath } from "@/lib/i18n/config";

function isCrawler(userAgent: string | null) {
  if (!userAgent) return false;
  return /bot|crawler|spider|crawling|google|bing|yandex|baidu|duckduck|slurp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|zalo/i.test(userAgent);
}

function isPublicPageRequest(pathname: string) {
  if (pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/_next")) return false;
  if (pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml") return false;
  return !/\.[a-z0-9]+$/i.test(pathname);
}

function isDocumentNavigationRequest(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  const fetchMode = request.headers.get("sec-fetch-mode");

  return request.method === "GET" && (fetchMode === "navigate" || accept.includes("text/html"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localized = stripLocaleFromPath(pathname);
  const effectivePathname = localized.pathname;

  if (effectivePathname === "/goi-du-lich" || effectivePathname.startsWith("/goi-du-lich/")) {
    const redirectUrl = request.nextUrl.clone();
    const nextPath = effectivePathname.replace(/^\/goi-du-lich/, "/combo-dac-san");
    redirectUrl.pathname = `${localePrefix(localized.locale)}${nextPath}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  const isInternalLocaleRewrite = request.headers.has("x-locale");
  const hasExplicitLocale = localized.pathname !== pathname;
  // Ưu tiên ngôn ngữ khách đã tự chọn (cookie); chỉ đoán theo Accept-Language khi chưa có cookie
  const chosenLocale = readLocaleCookie(request.cookies.get(LOCALE_COOKIE)?.value);
  const preferredLocale = chosenLocale ?? detectLocaleFromAcceptLanguage(request.headers.get("accept-language"));
  const preferredPrefix = localePrefix(preferredLocale);
  const shouldAutoRedirectLocale =
    !isInternalLocaleRewrite &&
    !hasExplicitLocale &&
    preferredPrefix.length > 0 &&
    isPublicPageRequest(pathname) &&
    isDocumentNavigationRequest(request) &&
    !isCrawler(request.headers.get("user-agent"));

  if (shouldAutoRedirectLocale) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname === "/" ? preferredPrefix : `${preferredPrefix}${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", effectivePathname);
  requestHeaders.set("x-locale", localized.locale);

  // /admin/* is rewritten to the backend (next.config.ts), whose own proxy validates admin_token.
  if (effectivePathname !== pathname) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = effectivePathname;
    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|be-static|favicon.ico|api).*)"],
};
