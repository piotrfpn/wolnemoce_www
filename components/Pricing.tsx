import { pricingAddOns, pricingPlans } from "@/lib/mockData";

export default function Pricing() {
  return (
    <section className="section" id="cennik">
      <div className="section-header fade-in visible">
        <div className="section-label">Cennik</div>
        <h2 className="section-title">Wybierz plan dla swojej firmy</h2>
        <p className="section-desc">
          Dopasuj plan do swoich potrzeb. Zwiększ widoczność, pozyskuj więcej
          zapytań i rozwijaj swój biznes.
        </p>
      </div>

      <div className="pricing-grid">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className={`pricing-card fade-in visible ${
              plan.isFeatured ? "featured" : ""
            }`}
          >
            {plan.isFeatured && (
              <div className="pricing-badge">Najpopularniejszy</div>
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

            {plan.cta === "Wkrótce" ? (
              <span className="btn btn-outline cursor-not-allowed opacity-60">
                {plan.cta}
              </span>
            ) : (
              <a
                href={plan.ctaHref}
                className={plan.isFeatured ? "btn btn-primary" : "btn btn-outline"}
              >
                {plan.cta}
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="pricing-addons fade-in visible">
        <h4>Dodatkowe opcje</h4>

        <div className="addons-grid">
          {pricingAddOns.map((addOn) => (
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
