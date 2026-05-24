// components/HowItWorks.tsx

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function HowItWorks({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getDictionary(locale).howItWorks;

  return (
    <section className="how-it-works" id="jak-to-dziala">
      <div className="section-header fade-in visible">
        <div className="section-label">{t.label}</div>
        <h2 className="section-title">{t.title}</h2>
        <p className="section-desc">
          {t.description}
        </p>
      </div>

      <div className="steps-grid">
        {t.steps.map((step, index) => (
          <div key={step.title} className="step-card fade-in visible">
            <div className="step-number">{index + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
