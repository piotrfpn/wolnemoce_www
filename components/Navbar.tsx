"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import AddOfferLinkClient from "./AddOfferLinkClient";
import AuthNavButton, { useCurrentUser } from "./AuthNavButton";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  type Locale,
  getLocaleFromPathname,
  getLocalizedPath,
  stripLocalePrefix,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function Navbar({ locale: localeProp }: { locale?: Locale }) {
  const pathname = usePathname();
  const locale = localeProp ?? getLocaleFromPathname(pathname);
  const normalizedPathname = stripLocalePrefix(pathname);
  const dictionary = getDictionary(locale);
  const t = dictionary.nav;
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useCurrentUser();
  const showContactCta = !isLoading && !user;
  const hideLanguageSwitcher =
    normalizedPathname.startsWith("/panel") ||
    normalizedPathname.startsWith("/admin");

  const closeMenu = () => setIsOpen(false);
  const navLinks = [
    { label: t.offers, href: "/oferty", match: "/oferty" },
    { label: t.companies, href: "/firmy", match: "/firmy" },
    { label: t.industries, href: "/#kategorie", match: null },
    { label: t.howItWorks, href: "/jak-to-dziala", match: "/jak-to-dziala" },
    { label: t.pricing, href: "/cennik", match: "/cennik" },
    { label: t.expert, href: "/#ekspert", match: null },
    { label: t.blog, href: "/blog", match: "/blog" },
    { label: t.contact, href: "/kontakt", match: "/kontakt" },
  ];
  const authLabels = {
    login: t.login,
    panel: t.panel,
    logout: t.logout,
    loggingOut: t.loggingOut,
  };
  const loginHref = getLocalizedPath("/logowanie", locale);
  return (
    <nav className="fixed left-0 right-0 top-0 z-[1000] border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6">
        <Link href={getLocalizedPath("/", locale)} className="flex items-center gap-3 no-underline" onClick={closeMenu}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] text-xl text-white shadow-md">
            <i className="fas fa-industry"></i>
          </div>
          <div className="text-[22px] font-extrabold tracking-[-0.5px] text-slate-800">
            Wolne<span className="text-[#1a5f3c]">Moce</span>.pl
          </div>
        </Link>

        <ul className="hidden list-none items-center gap-2 lg:flex">
          {navLinks.map((link) => {
            const href = getLocalizedPath(link.href, locale);
            const isActive = link.match ? normalizedPathname === link.match : false;

            return (
              <li key={link.href}>
                <Link
                  href={href}
                  onClick={closeMenu}
                  className={`rounded-lg px-4 py-2 text-sm font-medium no-underline transition ${
                    isActive
                      ? "bg-[#1a5f3c]/10 text-[#1a5f3c]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#1a5f3c]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {!hideLanguageSwitcher ? (
            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>
          ) : null}
          <AuthNavButton labels={authLabels} loginHref={loginHref} />
          {showContactCta ? (
            <Link
              href={getLocalizedPath("/kontakt", locale)}
              className="inline-flex items-center justify-center rounded-lg border-2 border-[#1a5f3c] px-5 py-2.5 text-sm font-semibold text-[#1a5f3c] no-underline transition hover:-translate-y-0.5 hover:bg-[#1a5f3c] hover:text-white hover:shadow-md"
            >
              {t.contact}
            </Link>
          ) : null}
          <AddOfferLinkClient locale={locale} className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-lg shadow-[#1a5f3c]/25 transition hover:-translate-y-0.5 hover:shadow-xl">
            {t.addOffer}
          </AddOfferLinkClient>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-800 lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={t.openMenu}
        >
          <i className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 shadow-xl lg:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const href = getLocalizedPath(link.href, locale);
              const isActive = link.match ? normalizedPathname === link.match : false;

              return (
                <Link
                  key={link.href}
                  href={href}
                  onClick={closeMenu}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold no-underline ${
                    isActive
                      ? "bg-[#1a5f3c]/10 text-[#1a5f3c]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-3 grid grid-cols-1 gap-3">
              {!hideLanguageSwitcher ? (
                <Suspense fallback={null}>
                  <LanguageSwitcher />
                </Suspense>
              ) : null}
              <AuthNavButton
                variant="mobile"
                onNavigate={closeMenu}
                labels={authLabels}
                loginHref={loginHref}
              />
              {showContactCta ? (
                <Link
                  href={getLocalizedPath("/kontakt", locale)}
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline"
                >
                  {t.contact}
                </Link>
              ) : null}
              <AddOfferLinkClient
                locale={locale}
                onNavigate={closeMenu}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] px-5 py-3 text-sm font-bold text-white no-underline shadow-lg shadow-[#1a5f3c]/25"
              >
                {t.addOffer}
              </AddOfferLinkClient>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
