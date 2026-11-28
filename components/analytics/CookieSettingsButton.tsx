"use client";

import { openCookieSettings } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/config";

const LABELS: Record<Locale, string> = {
  pl: "Ustawienia cookies",
  en: "Cookie settings",
  de: "Cookie-Einstellungen",
  es: "Configurar cookies",
  fr: "Paramètres cookies",
  uk: "Налаштування cookies",
};

export default function CookieSettingsButton({
  locale = "pl",
  className = "cursor-pointer border-0 bg-transparent p-0 text-sm text-white/40 transition hover:text-white",
}: {
  locale?: Locale;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className}
    >
      {LABELS[locale] ?? LABELS.pl}
    </button>
  );
}
