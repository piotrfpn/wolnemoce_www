import Link from "next/link";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function SoftLaunchSection({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getDictionary(locale).softLaunch;

  return (
    <section className="bg-white px-6 py-12 md:py-16 border-t border-slate-100">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-4 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
          Soft Launch
        </div>
        <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {t.title}
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600">
          {t.description}
        </p>
        <Link
          href={getLocalizedPath("/dodaj-oferte", locale)}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-4 text-[15px] font-bold text-white no-underline transition hover:bg-slate-800 shadow-md"
        >
          {t.cta}
        </Link>
      </div>
    </section>
  );
}
