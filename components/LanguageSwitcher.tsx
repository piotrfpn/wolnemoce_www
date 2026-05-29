"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const currentLocale = getLocaleFromPathname(pathname);
  const query = searchParams.toString();
  const currentLabel = localeLabels[currentLocale];

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Zmień język"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex h-10 min-w-[62px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-[#1a5f3c] shadow-sm transition hover:border-[#1a5f3c]/40 hover:bg-slate-50"
      >
        {currentLabel}
        <i
          className={`fas fa-chevron-down text-[10px] transition ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        ></i>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-24 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          {supportedLocales.map((locale) => {
            const isActive = locale === currentLocale;

            return (
              <Link
                key={locale}
                href={getLocalizedHref(pathname, locale, query)}
                onClick={() => {
                  document.cookie = `wm_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
                  setIsOpen(false);
                }}
                className={`flex items-center justify-center rounded-lg px-3 py-2 text-xs font-extrabold no-underline transition ${
                  isActive
                    ? "bg-[#1a5f3c] text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#1a5f3c]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {localeLabels[locale]}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
