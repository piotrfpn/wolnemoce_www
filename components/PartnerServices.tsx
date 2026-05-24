import Link from "next/link";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function PartnerServices({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getDictionary(locale).partners;

  return (
    <section className="section bg-slate-50" id="partnerzy-uslugowi">
      <div className="section-header fade-in visible">
        <div className="section-label">{t.label}</div>
        <h2 className="section-title">{t.title}</h2>
        <p className="section-desc">
          {t.description}
        </p>
      </div>

      <div className="mx-auto grid max-w-[1100px] min-w-0 gap-6 px-0 md:grid-cols-2">
        {t.items.map((partner) => (
          <article
            key={partner.name}
            className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:p-8"
          >
            <div className="mb-6 flex min-w-0 items-center gap-4">
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-[#1a5f3c]/40"
                aria-label={`Strona partnera ${partner.name}`}
              >
                <img
                  src={partner.image}
                  alt={`Logo ${partner.name}`}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full object-contain"
                />
              </a>
              <div className="min-w-0">
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-extrabold text-slate-900 no-underline transition hover:text-[#1a5f3c]"
                >
                  {partner.name}
                </a>
                <p className="mt-1 text-sm font-bold text-[#1a5f3c]">
                  {partner.subtitle}
                </p>
              </div>
            </div>

            <p className="min-h-[96px] text-sm leading-7 text-slate-600">
              {partner.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                {t.paidBadge}
              </span>
              <Link
                href={getLocalizedPath(partner.href, locale)}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline transition hover:text-[#0d3d26]"
              >
                {partner.cta}
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 no-underline transition hover:text-[#1a5f3c]"
              >
                {t.website}
                <i className="fas fa-up-right-from-square text-xs"></i>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
