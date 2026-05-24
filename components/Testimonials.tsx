// components/Testimonials.tsx

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function Testimonials({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getDictionary(locale).testimonials;

  return (
    <section className="section">
      <div className="section-header fade-in visible">
        <div className="section-label">{t.label}</div>
        <h2 className="section-title">{t.title}</h2>
        <p className="section-desc">
          {t.description}
        </p>
      </div>

      <div className="testimonials-grid">
        {t.items.map((item, index) => (
          <div key={item.author} className="testimonial-card fade-in visible">
            <div className="testimonial-quote">&quot;</div>

            <p className="testimonial-text">{item.text}</p>

            <div className="testimonial-author">
              <div
                className="testimonial-avatar"
                style={item.gradient ? { background: item.gradient } : undefined}
              >
                {item.initials}
              </div>

              <div className="testimonial-info">
                <h4>{item.author}</h4>
                <p>{item.role}</p>
              </div>

              <div className="testimonial-rating">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className={`fas ${index === 2 ? "fa-star-half-alt" : "fa-star"}`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
