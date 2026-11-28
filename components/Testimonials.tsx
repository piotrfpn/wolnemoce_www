// components/Testimonials.tsx

import Link from "next/link";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

const AUDIENCE_HREFS = [
  "/dodaj-zapytanie",
  "/dodaj-oferte",
  "/dodaj-zapytanie",
] as const;

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
        {t.items.map((item, index) => (
          <Link
            key={item.author}
            href={getLocalizedPath(AUDIENCE_HREFS[index] ?? "/dodaj-zapytanie", locale)}
            className="group flex min-w-0 flex-col rounded-[20px] border border-transparent bg-white p-8 text-inherit no-underline shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:border-[#1a5f3c]/30 hover:shadow-[0_12px_32px_rgba(26,95,60,0.12)] fade-in visible"
          >
            <p className="mb-8 flex-1 text-[15px] leading-relaxed text-slate-600 font-medium">
              {item.text}
            </p>

            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold tracking-wide text-white shadow-md"
                  style={{ background: item.gradient || "linear-gradient(135deg, #0d3d26, #1a5f3c)" }}
                >
                  {item.initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[15px] font-bold text-slate-900 leading-tight transition group-hover:text-[#1a5f3c]">
                    {item.author}
                  </h4>
                  {item.role && (
                    <p className="mt-1 text-[13px] font-medium text-slate-500">
                      {item.role}
                    </p>
                  )}
                </div>
              </div>
              <i className="fas fa-arrow-right shrink-0 text-[#1a5f3c] opacity-75 transition group-hover:translate-x-1 group-hover:opacity-100"></i>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
