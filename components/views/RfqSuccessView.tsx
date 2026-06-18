import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getLocalizedPath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";

export default function RfqSuccessView({
  locale,
  t,
}: {
  locale: Locale;
  t: Dictionary["rfqSuccess"];
}) {
  return (
    <>
      <Navbar locale={locale} />
      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-20 pt-36 text-white">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto max-w-[900px] text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#1a5f3c] shadow-xl">
              <i className="fas fa-check-circle text-4xl"></i>
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/85">
              {t.heroDescription}
            </p>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-[900px] rounded-[24px] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-10">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {t.nextStepsTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              {t.nextStepsDescription}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link href={getLocalizedPath("/oferty", locale)} className="btn btn-primary">
                {t.backToOffers}
              </Link>
              <Link href={getLocalizedPath("/", locale)} className="btn btn-outline">
                {t.homePage}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
