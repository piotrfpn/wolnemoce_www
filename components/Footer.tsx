import Link from "next/link";
import AddOfferLinkClient from "./AddOfferLinkClient";
import CookieSettingsButton from "./analytics/CookieSettingsButton";
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
                Wolne<span className="text-[#2d8a5e]">Moce</span>
              </div>
            </Link>

            <p className="mb-6 max-w-sm text-sm leading-7 text-white/60">
              {t.description}
            </p>

            <div className="flex gap-3">
              {[
                [
                  "LinkedIn",
                  "fab fa-linkedin-in",
                  "https://www.linkedin.com/company/wolnemoce/",
                ],
                [
                  "Facebook",
                  "fab fa-facebook-f",
                  "https://www.facebook.com/wolnemoce",
                ],
                [
                  "Instagram",
                  "fab fa-instagram",
                  "https://www.instagram.com/wolnemoce/",
                ],
              ].map(([label, icon, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
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
                <AddOfferLinkClient locale={locale} className="text-sm text-white/60 no-underline transition hover:text-white">
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
                <Link href={getLocalizedPath("/regulamin", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {t.terms}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath("/polityka-prywatnosci", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath("/polityka-cookies", locale)} className="text-sm text-white/60 no-underline transition hover:text-white">
                  {t.cookies}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-bold text-white">{dictionary.nav.contact}</h4>
            <ul className="space-y-3 list-none text-sm text-white/70">
              <li>
                <a
                  href="mailto:kontakt@wolnemoce.com"
                  className="inline-flex items-center gap-2 text-white/80 no-underline transition hover:text-white"
                >
                  <i className="fas fa-envelope text-[#2d8a5e]"></i>
                  <span>kontakt@wolnemoce.com</span>
                </a>
              </li>
              <li>
                <span className="block text-xs text-white/45">Piotr Fiszer</span>
                <a
                  href="tel:+48604904150"
                  className="inline-flex items-center gap-2 text-white/80 no-underline transition hover:text-white"
                >
                  <i className="fas fa-phone text-[#2d8a5e]"></i>
                  <span>+48 604 904 150</span>
                </a>
              </li>
              <li>
                <span className="block text-xs text-white/45">Łukasz Antczak</span>
                <a
                  href="tel:+48788750273"
                  className="inline-flex items-center gap-2 text-white/80 no-underline transition hover:text-white"
                >
                  <i className="fas fa-phone text-[#2d8a5e]"></i>
                  <span>+48 788 750 273</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p>{t.rights}</p>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link href={getLocalizedPath("/regulamin", locale)} className="text-white/40 no-underline transition hover:text-white">
              {t.terms}
            </Link>
            <Link href={getLocalizedPath("/polityka-prywatnosci", locale)} className="text-white/40 no-underline transition hover:text-white">
              {t.privacy}
            </Link>
            <Link href={getLocalizedPath("/polityka-cookies", locale)} className="text-white/40 no-underline transition hover:text-white">
              Cookies
            </Link>
            <CookieSettingsButton locale={locale} />
          </div>
        </div>
      </div>
    </footer>
  );
}
