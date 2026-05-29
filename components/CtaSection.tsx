// components/CtaSection.tsx

import Link from "next/link";
import AddOfferLinkClient from "./AddOfferLinkClient";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function CtaSection({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getDictionary(locale).cta;

  return (
    <section className="px-6 py-20">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0d3d26] to-[#1a5f3c] px-6 py-16 text-center text-white md:px-16 md:py-20">
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px)] [background-size:60px_60px,40px_40px]" />

        <div className="relative z-10">
          <h2 className="mb-4 text-3xl font-extrabold tracking-[-1px] md:text-4xl">
            {t.title}
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-white/80">
            {t.description}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <AddOfferLinkClient
              locale={locale}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] px-10 py-4 text-base font-bold text-white no-underline shadow-lg shadow-[#f59e0b]/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {t.addOffer}
            </AddOfferLinkClient>

            <Link
              href={getLocalizedPath("/oferty", locale)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-10 py-4 text-base font-bold text-white no-underline transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              <i className="fas fa-search"></i>
              {t.browseOffers}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
