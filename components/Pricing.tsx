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

        <div className="addons-grid">
          {t.addOns.map((addOn) => (
            <div key={addOn.name} className="addon-card">
              <h5>{addOn.name}</h5>
              <p>{addOn.description}</p>
              <div className="price">
                {addOn.price} <span>{addOn.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
