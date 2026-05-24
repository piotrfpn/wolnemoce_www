// components/ExpertSection.tsx

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function ExpertSection({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getDictionary(locale).expert;

  return (
    <section className="expert-section" id="ekspert">
      <div className="expert-content">
        <div className="expert-left">
          <div
            className="section-header"
            style={{
              textAlign: "left",
              margin: "0 0 32px 0",
              maxWidth: "100%",
            }}
          >
            <div className="section-label">{t.label}</div>

            <h2 className="section-title">
              {t.title}
            </h2>

            <p
              className="section-desc"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              {t.description}
            </p>
          </div>

          <div className="expert-features">
            {t.features.map((feature) => (
              <div key={feature.title} className="expert-feature">
                <i className={feature.icon}></i>
                <div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="expert-right">
          {t.stats.map((stat) => (
            <div key={stat.label} className="expert-stat-card">
              <i className={stat.icon}></i>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
