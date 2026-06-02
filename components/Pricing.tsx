import Link from "next/link";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function Pricing({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getDictionary(locale).pricing;

  return (
    <section className="section" id="cennik">
      <div className="section-header fade-in visible">
        <div className="section-label">{t.label}</div>
        <h2 className="section-title">{t.title}</h2>
        <p className="section-desc">
          {t.description}
        </p>
      </div>

      <div className="pricing-grid">
        {t.plans.map((plan) => (
          <div
            key={plan.name}
            className={`pricing-card fade-in visible ${
              plan.isFeatured ? "featured" : ""
            }`}
          >
            {plan.isFeatured && (
              <div className="pricing-badge">{t.mostPopular}</div>
            )}

            <h3>{plan.name}</h3>
            <p className="subtitle">{plan.subtitle}</p>

            <div className="price">
              {plan.price} <span>{plan.priceSuffix}</span>
            </div>

            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <i className="fas fa-check-circle"></i> {feature}
                </li>
              ))}
            </ul>

            {plan.disabled ? (
              <span className="btn btn-outline cursor-not-allowed opacity-60">
                {plan.cta}
              </span>
            ) : (
              <a
                href={getLocalizedPath(plan.ctaHref, locale)}
                className={plan.isFeatured ? "btn btn-primary" : "btn btn-outline"}
              >
                {plan.cta}
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="pricing-addons fade-in visible">
        <h4>{t.addOnsTitle}</h4>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 items-stretch">
          {t.addOns.map((addOn, index) => {
            let href = "/kontakt";
            if (index === 2) href = "/kontakt?temat=credos";
            if (index === 3) href = "/kontakt?temat=logimarket";

            return (
              <Link
                key={addOn.name}
                href={getLocalizedPath(href, locale)}
                className="group flex flex-col h-full min-h-full no-underline text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 hover:border-emerald-500 hover:shadow-md transition-all rounded-[var(--radius-lg,16px)] border border-slate-200 bg-white p-5 sm:p-7 text-left"
              >
                <h5 className="mb-3 text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{addOn.name}</h5>
                <p className="flex-1 text-sm text-slate-500 leading-relaxed mb-6">{addOn.description}</p>
                <div className="mt-auto flex items-baseline gap-1.5 whitespace-nowrap mb-4">
                  <span className="text-2xl font-extrabold text-emerald-700">{addOn.price}</span>
                  <span className="text-sm font-medium text-slate-500">{addOn.suffix}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors">{addOn.cta}</span>
                  <i className="fas fa-arrow-right text-emerald-600 text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"></i>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

