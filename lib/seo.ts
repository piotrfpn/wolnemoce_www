import type { Metadata } from "next";
import {
  defaultLocale,
  getLocalizedPath,
  supportedLocales,
  type Locale,
} from "@/lib/i18n/config";

const siteUrl = "https://www.wolnemoce.com";
const defaultOgImage = "/images/offers/automation.jpg";

const openGraphLocales: Record<Locale, string> = {
  pl: "pl_PL",
  en: "en_US",
  de: "de_DE",
  uk: "uk_UA",
  es: "es_ES",
  fr: "fr_FR",
};

export function getSiteUrl() {
  return siteUrl;
}

export function getAbsoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncateSeoDescription(value: string, maxLength = 160) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

export function createPageMetadata({
  title,
  description,
  path,
  locale = defaultLocale,
  includeLanguages = true,
}: {
  title: string;
  description: string;
  path: string;
  locale?: Locale;
  includeLanguages?: boolean;
}): Metadata {
  const canonical = getLocalizedPath(path, locale);
  const imageUrl = getAbsoluteUrl(defaultOgImage);

  return {
    title,
    description,
    alternates: {
      canonical,
      ...(includeLanguages
        ? {
            languages: Object.fromEntries(
              supportedLocales.map((item) => [
                item,
                getLocalizedPath(path, item),
              ])
            ),
          }
        : {}),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "WolneMoce",
      locale: openGraphLocales[locale],
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "WolneMoce - marketplace B2B wolnych mocy produkcyjnych",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
