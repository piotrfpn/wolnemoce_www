"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  getLocalizedHref,
  getLocaleFromPathname,
  supportedLocales,
  type Locale,
} from "@/lib/i18n/config";

const localeLabels: Record<Locale, string> = {
  pl: "PL",
  en: "EN",
  de: "DE",
  uk: "UA",
  es: "ES",
  fr: "FR",
};

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = getLocaleFromPathname(pathname);
  const query = searchParams.toString();

  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
      {supportedLocales.map((locale) => {
        const isActive = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={getLocalizedHref(pathname, locale, query)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold no-underline transition ${
              isActive
                ? "bg-[#1a5f3c] text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-[#1a5f3c]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </div>
  );
}
