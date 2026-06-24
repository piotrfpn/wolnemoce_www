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

      <div className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3">
        {t.items.map((item) => (
          <div key={item.author} className="flex flex-col rounded-[20px] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] fade-in visible">
            <p className="mb-8 flex-1 text-[15px] leading-relaxed text-slate-600 font-medium">
              {item.text}
            </p>

            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-md"
                  style={{ background: item.gradient || "linear-gradient(135deg, #0d3d26, #1a5f3c)" }}
                >
                  {item.initials}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900 leading-tight">
                    {item.author}
                  </h4>
                  {item.role && (
                    <p className="mt-1 text-[13px] font-medium text-slate-500">
                      {item.role}
                    </p>
                  )}
                </div>
              </div>
              <i className="fas fa-circle-check text-[#1a5f3c] opacity-80"></i>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
