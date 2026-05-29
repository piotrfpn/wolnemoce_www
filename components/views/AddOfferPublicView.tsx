import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

const stepIcons = [
  "fas fa-user-plus",
  "fas fa-building",
  "fas fa-clipboard-list",
  "fas fa-shield-alt",
  "fas fa-bullhorn",
];

export default function AddOfferPublicView({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const t = getDictionary(locale).addOfferPage;
  const nextPath = "/panel/oferty/nowa";
  const createAccountHref = `${getLocalizedPath(
    "/rejestracja",
    locale
  )}?next=${encodeURIComponent(nextPath)}`;
  const loginHref = `${getLocalizedPath("/logowanie", locale)}?next=${encodeURIComponent(
    nextPath
  )}`;

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label={t.heroLabel}
          title={t.title}
          description={t.subtitle}
          icon="fas fa-plus"
        />

        <section className="section">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                <i className="fas fa-industry text-xl"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {t.cardTitle}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {t.cardDescription}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={createAccountHref} className="btn btn-primary">
                  {t.createAccount}
                </Link>
                <Link
                  href={loginHref}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
                >
                  {t.login}
                </Link>
              </div>

              <Link
                href={getLocalizedPath("/oferty", locale)}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1a5f3c] no-underline"
              >
                {t.viewOffers}
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>

            <div className="grid min-w-0 gap-4">
              {t.steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex min-w-0 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                    <i className={`${stepIcons[index] ?? stepIcons[0]} text-base`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                      {t.stepLabel} {index + 1}
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
