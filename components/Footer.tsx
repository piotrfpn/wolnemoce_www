import Link from "next/link";
import AddOfferLinkClient from "./AddOfferLinkClient";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function Footer({ locale = defaultLocale }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.footer;

  return (
    <footer className="bg-slate-800 px-6 py-16 text-white">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1.5fr]">
          <div>
            <Link href={getLocalizedPath("/", locale)} className="mb-5 flex items-center gap-3 no-underline">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] text-xl text-white shadow-md">
                <i className="fas fa-industry"></i>
              </div>
              <div className="text-[22px] font-extrabold tracking-[-0.5px] text-white">
                Wolne<span className="text-[#2d8a5e]">Moce</span>.pl
              </div>
            </Link>

            <p className="mb-6 max-w-sm text-sm leading-7 text-white/60">
              {t.description}
            </p>

            <div className="flex gap-3">
              {[
                ["LinkedIn", "fab fa-linkedin-in"],
                ["Facebook", "fab fa-facebook-f"],
                ["X", "fab fa-twitter"],
                ["YouTube", "fab fa-youtube"],
              ].map(([label, icon]) => (
                <a
                  key={label}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm text-white no-underline transition hover:-translate-y-0.5 hover:bg-[#1a5f3c]"
                  aria-label={label}
                >
                  <i className={icon}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-base font-bold text-white">{t.portal}</h4>
            <ul className="space-y-3 list-none">
              <li>
                <Link href={getLocalizedPath("/oferty", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {t.productionOffers}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath("/firmy", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {t.companyCatalog}
                </Link>
              </li>
              <li>
                <AddOfferLinkClient className="text-sm text-white/60 no-underline transition hover:text-white">
                  {t.addOffer}
                </AddOfferLinkClient>
              </li>
              <li>
                <Link href={getLocalizedPath("/jak-to-dziala", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {dictionary.nav.howItWorks}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath("/cennik", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {dictionary.nav.pricing}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath("/blog", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {dictionary.nav.blog}
                </Link>
              </li>
              <li>
                <Link href="/zapytanie-ofertowe" className="text-sm text-white/60 no-underline transition hover:text-white">
                  Zapytanie ofertowe
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-base font-bold text-white">{t.industries}</h4>
            <ul className="space-y-3 list-none">
              {dictionary.categories.items.slice(0, 5).map((category) => (
                  <li key={category.name}>
                    <Link href={getLocalizedPath("/#kategorie", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                      {category.name}
                    </Link>
                  </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-base font-bold text-white">{t.company}</h4>
            <ul className="space-y-3 list-none">
              <li>
                <Link href={getLocalizedPath("/#ekspert", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {dictionary.nav.expert}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath("/kontakt", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {dictionary.nav.contact}
                </Link>
              </li>
              <li>
                <Link href={`${getLocalizedPath("/kontakt", locale)}?temat=administracja`} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {t.adminContact}
                </Link>
              </li>
              <li>
                <Link href="/regulamin" className="text-sm text-white/60 no-underline transition hover:text-white">
                  {t.terms}
                </Link>
              </li>
              <li>
                <Link href="/polityka-prywatnosci" className="text-sm text-white/60 no-underline transition hover:text-white">
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link href="/polityka-cookies" className="text-sm text-white/60 no-underline transition hover:text-white">
                  {t.cookies}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-bold text-white">{t.newsletter}</h4>
            <p className="mb-5 text-sm leading-6 text-white/60">
              {t.newsletterCopy}
            </p>

            <form className="flex gap-2">
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#2d8a5e]"
              />
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a5f3c] text-white transition hover:bg-[#2d8a5e]"
                aria-label={t.newsletterSubmit}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <p>{t.rights}</p>

          <div className="flex flex-wrap gap-5">
            <Link href="/regulamin" className="text-white/40 no-underline transition hover:text-white">
              {t.terms}
            </Link>
            <Link href="/polityka-prywatnosci" className="text-white/40 no-underline transition hover:text-white">
              {t.privacy}
            </Link>
            <Link href="/polityka-cookies" className="text-white/40 no-underline transition hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
