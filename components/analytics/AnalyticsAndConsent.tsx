"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import {
  applyGoogleConsent,
  OPEN_COOKIE_SETTINGS_EVENT,
  readCookieConsent,
  saveCookieConsent,
  type CookieConsent,
} from "@/lib/analytics";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";

type AnalyticsAndConsentProps = {
  locale?: Locale;
};

type BannerCopy = {
  title: string;
  description: string;
  policyLink: string;
  acceptAll: string;
  necessaryOnly: string;
  customize: string;
  savePreferences: string;
  necessaryLabel: string;
  necessaryDesc: string;
  analyticsLabel: string;
  analyticsDesc: string;
  marketingLabel: string;
  marketingDesc: string;
};

const BANNER_COPY: Record<Locale, BannerCopy> = {
  pl: {
    title: "Pliki cookies i prywatność",
    description:
      "Używamy niezbędnych cookies do działania portalu oraz — za Twoją zgodą — cookies analitycznych (Google Analytics 4) i marketingowych (Meta Pixel), aby mierzyć skuteczność kampanii.",
    policyLink: "Polityka cookies",
    acceptAll: "Akceptuj wszystkie",
    necessaryOnly: "Tylko niezbędne",
    customize: "Ustawienia",
    savePreferences: "Zapisz wybór",
    necessaryLabel: "Niezbędne",
    necessaryDesc: "Wymagane do logowania, bezpieczeństwa i działania formularzy (zawsze aktywne).",
    analyticsLabel: "Analityczne (GA4)",
    analyticsDesc: "Pomagają nam mierzyć ruch i ulepszać proces dodawania ofert.",
    marketingLabel: "Marketingowe (Meta Pixel)",
    marketingDesc: "Pozwalają mierzyć skuteczność reklam na Facebooku i Instagramie.",
  },
  en: {
    title: "Cookies & privacy",
    description:
      "We use essential cookies to run the portal and — with your consent — analytics (Google Analytics 4) and marketing cookies (Meta Pixel) to measure campaign effectiveness.",
    policyLink: "Cookie Policy",
    acceptAll: "Accept all",
    necessaryOnly: "Necessary only",
    customize: "Settings",
    savePreferences: "Save preferences",
    necessaryLabel: "Necessary",
    necessaryDesc: "Required for login, security and core forms (always active).",
    analyticsLabel: "Analytics (GA4)",
    analyticsDesc: "Help us measure traffic and improve the offer submission flow.",
    marketingLabel: "Marketing (Meta Pixel)",
    marketingDesc: "Help measure the effectiveness of Facebook and Instagram campaigns.",
  },
  de: {
    title: "Cookies & Datenschutz",
    description:
      "Wir verwenden notwendige Cookies für den Betrieb des Portals sowie — mit Ihrer Zustimmung — Analyse- (Google Analytics 4) und Marketing-Cookies (Meta Pixel).",
    policyLink: "Cookie-Richtlinie",
    acceptAll: "Alle akzeptieren",
    necessaryOnly: "Nur notwendige",
    customize: "Einstellungen",
    savePreferences: "Auswahl speichern",
    necessaryLabel: "Notwendig",
    necessaryDesc: "Erforderlich für Anmeldung, Sicherheit und Formulare (immer aktiv).",
    analyticsLabel: "Analyse (GA4)",
    analyticsDesc: "Helfen uns, den Traffic zu messen und das Portal zu verbessern.",
    marketingLabel: "Marketing (Meta Pixel)",
    marketingDesc: "Messen die Wirksamkeit von Facebook- und Instagram-Kampagnen.",
  },
  es: {
    title: "Cookies y privacidad",
    description:
      "Utilizamos cookies necesarias para el funcionamiento del portal y — con su consentimiento — cookies analíticas (Google Analytics 4) y de marketing (Meta Pixel).",
    policyLink: "Política de cookies",
    acceptAll: "Aceptar todas",
    necessaryOnly: "Solo necesarias",
    customize: "Configurar",
    savePreferences: "Guardar selección",
    necessaryLabel: "Necesarias",
    necessaryDesc: "Imprescindibles para el inicio de sesión, seguridad y formularios.",
    analyticsLabel: "Analíticas (GA4)",
    analyticsDesc: "Nos ayudan a medir el tráfico y mejorar el portal.",
    marketingLabel: "Marketing (Meta Pixel)",
    marketingDesc: "Permiten medir la eficacia de las campañas en Facebook e Instagram.",
  },
  fr: {
    title: "Cookies et confidentialité",
    description:
      "Nous utilisons des cookies nécessaires au fonctionnement du portail et — avec votre accord — des cookies analytiques (Google Analytics 4) et marketing (Meta Pixel).",
    policyLink: "Politique cookies",
    acceptAll: "Tout accepter",
    necessaryOnly: "Nécessaires uniquement",
    customize: "Paramètres",
    savePreferences: "Enregistrer",
    necessaryLabel: "Nécessaires",
    necessaryDesc: "Indispensables à la connexion, la sécurité et aux formulaires.",
    analyticsLabel: "Analytiques (GA4)",
    analyticsDesc: "Nous aident à mesurer l’audience et améliorer le portail.",
    marketingLabel: "Marketing (Meta Pixel)",
    marketingDesc: "Permettent de mesurer l’efficacité des campagnes Facebook et Instagram.",
  },
  uk: {
    title: "Cookies та конфіденційність",
    description:
      "Ми використовуємо необхідні cookies для роботи порталу та — за вашою згодою — аналітичні (Google Analytics 4) й маркетингові cookies (Meta Pixel).",
    policyLink: "Політика cookies",
    acceptAll: "Прийняти всі",
    necessaryOnly: "Лише необхідні",
    customize: "Налаштування",
    savePreferences: "Зберегти вибір",
    necessaryLabel: "Необхідні",
    necessaryDesc: "Потрібні для входу, безпеки та роботи форм (завжди активні).",
    analyticsLabel: "Аналітичні (GA4)",
    analyticsDesc: "Допомагають вимірювати трафік і покращувати портал.",
    marketingLabel: "Маркетингові (Meta Pixel)",
    marketingDesc: "Дозволяють оцінювати ефективність кампаній у Facebook та Instagram.",
  },
};

const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
const META_PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim();

export default function AnalyticsAndConsent({
  locale = defaultLocale,
}: AnalyticsAndConsentProps) {
  const copy = BANNER_COPY[locale] ?? BANNER_COPY.pl;
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(true);
  const [marketingChecked, setMarketingChecked] = useState(true);

  useEffect(() => {
    const existing = readCookieConsent();
    if (existing) {
      setConsent(existing);
      setAnalyticsChecked(existing.analytics);
      setMarketingChecked(existing.marketing);
      applyGoogleConsent(existing);
      setIsBannerOpen(false);
    } else {
      setIsBannerOpen(true);
    }

    function handleOpenSettings() {
      const current = readCookieConsent();
      setAnalyticsChecked(current ? current.analytics : true);
      setMarketingChecked(current ? current.marketing : true);
      setShowCustomize(true);
      setIsBannerOpen(true);
    }

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    };
  }, []);

  function handleAcceptAll() {
    const saved = saveCookieConsent({ analytics: true, marketing: true });
    setConsent(saved);
    setAnalyticsChecked(true);
    setMarketingChecked(true);
    setIsBannerOpen(false);
    setShowCustomize(false);
  }

  function handleNecessaryOnly() {
    const saved = saveCookieConsent({ analytics: false, marketing: false });
    setConsent(saved);
    setAnalyticsChecked(false);
    setMarketingChecked(false);
    setIsBannerOpen(false);
    setShowCustomize(false);
  }

  function handleSaveCustom() {
    const saved = saveCookieConsent({
      analytics: analyticsChecked,
      marketing: marketingChecked,
    });
    setConsent(saved);
    setIsBannerOpen(false);
    setShowCustomize(false);
  }

  const shouldLoadMetaPixel = Boolean(META_PIXEL_ID && consent?.marketing);

  return (
    <>
      {GA_MEASUREMENT_ID ? (
        <>
          <Script id="wm-ga-consent-default" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500
              });
            `}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`}
            strategy="afterInteractive"
            onLoad={() => {
              const current = readCookieConsent();
              if (current) {
                applyGoogleConsent(current);
              }
            }}
          />
          <Script id="wm-ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)}, { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {shouldLoadMetaPixel ? (
        <Script id="wm-meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', ${JSON.stringify(META_PIXEL_ID)});
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}

      {isBannerOpen ? (
        <div
          role="dialog"
          aria-label={copy.title}
          className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl md:p-6"
        >
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {copy.title}
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm">
                {copy.description}{" "}
                <Link
                  href={getLocalizedPath("/polityka-cookies", locale)}
                  className="font-semibold text-[#1a5f3c] underline underline-offset-2"
                >
                  {copy.policyLink}
                </Link>
              </p>
            </div>

            {showCustomize ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="mt-0.5 h-4 w-4 rounded accent-[#1a5f3c]"
                  />
                  <span>
                    <strong className="block text-slate-900">{copy.necessaryLabel}</strong>
                    <span className="text-slate-600">{copy.necessaryDesc}</span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={analyticsChecked}
                    onChange={(event) => setAnalyticsChecked(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#1a5f3c]"
                  />
                  <span>
                    <strong className="block text-slate-900">{copy.analyticsLabel}</strong>
                    <span className="text-slate-600">{copy.analyticsDesc}</span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={marketingChecked}
                    onChange={(event) => setMarketingChecked(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#1a5f3c]"
                  />
                  <span>
                    <strong className="block text-slate-900">{copy.marketingLabel}</strong>
                    <span className="text-slate-600">{copy.marketingDesc}</span>
                  </span>
                </label>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-end gap-2.5">
              {!showCustomize ? (
                <button
                  type="button"
                  onClick={() => setShowCustomize(true)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  {copy.customize}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="rounded-xl border border-[#1a5f3c] bg-white px-4 py-2.5 text-xs font-bold text-[#1a5f3c] transition hover:bg-emerald-50"
                >
                  {copy.savePreferences}
                </button>
              )}

              <button
                type="button"
                onClick={handleNecessaryOnly}
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                {copy.necessaryOnly}
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="rounded-xl bg-[#1a5f3c] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#144a2f]"
              >
                {copy.acceptAll}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
