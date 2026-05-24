import Link from "next/link";
import AddOfferLinkClient from "@/components/AddOfferLinkClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function HowItWorksView({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const t = getDictionary(locale).howItWorksPage;
  return (
    <>
      <Navbar />

      <main>
        <PageHero
          label={t.heroLabel}
          title={t.heroTitle}
          description={t.heroDescription}
          icon="fas fa-route"
          actions={
            <>
              <Link href={getLocalizedPath("/oferty", locale)} className="btn btn-accent">
                {t.browseOffers} <i className="fas fa-arrow-right"></i>
              </Link>
              <AddOfferLinkClient className="btn btn-outline bg-white text-[#1a5f3c]">
                {t.addOffer}
              </AddOfferLinkClient>
            </>
          }
        />

        <section className="section">
          <div className="section-header fade-in visible">
            <div className="section-label">{t.sectionLabel}</div>
            <h2 className="section-title">{t.sectionTitle}</h2>
            <p className="section-desc">
              {t.sectionDescription}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-[#1a5f3c]">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="mb-4 text-2xl font-extrabold text-slate-900">
                {t.buyerTitle}
              </h3>
              <div className="space-y-4">
                {t.buyerSteps.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a5f3c] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-[#f59e0b]">
                <i className="fas fa-industry"></i>
              </div>
              <h3 className="mb-4 text-2xl font-extrabold text-slate-900">
                {t.supplierTitle}
              </h3>
              <div className="space-y-4">
                {t.supplierSteps.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a5f3c] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto grid max-w-[1400px] gap-6 md:grid-cols-3">
            {t.benefits.map(({ icon, title, description }) => (
              <div key={title} className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm">
                <i className={`${icon} mb-5 text-3xl text-[#1a5f3c]`}></i>
                <h3 className="mb-3 text-xl font-extrabold text-slate-900">{title}</h3>
                <p className="text-sm leading-7 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="rounded-[24px] bg-gradient-to-br from-[#0d3d26] to-[#1a5f3c] p-8 text-white md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h2 className="mb-4 text-3xl font-extrabold md:text-4xl">
                  {t.safetyTitle}
                </h2>
                <p className="text-base leading-8 text-white/80">
                  {t.safetyDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {t.safetyTags.map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}
