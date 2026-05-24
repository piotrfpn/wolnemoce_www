export const defaultLocale = "pl" as const;

export const supportedLocales = ["pl", "en", "de", "uk", "es", "fr"] as const;

export const prefixedLocales = supportedLocales.filter(
  (locale) => locale !== defaultLocale
);

export type Locale = (typeof supportedLocales)[number];

export function isSupportedLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  return firstSegment && isSupportedLocale(firstSegment)
    ? firstSegment
    : defaultLocale;
}

export function stripLocalePrefix(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && isSupportedLocale(firstSegment)) {
    return `/${segments.slice(1).join("/")}` || "/";
  }

  return pathname || "/";
}

export function getLocalizedPath(pathname: string, locale: Locale) {
  const normalizedPath = stripLocalePrefix(pathname);

  if (locale === defaultLocale) {
    return normalizedPath;
  }

  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function getLocalizedHref(pathname: string, locale: Locale, search = "") {
  const path = getLocalizedPath(pathname, locale);
  const query = search.startsWith("?") ? search : search ? `?${search}` : "";

  return `${path}${query}`;
}

