// components/Hero.tsx

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-20 pt-[140px]">
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

      <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm font-medium text-white backdrop-blur">
            <i className="fas fa-star text-[#fbbf24]"></i>
            #1 Portal wolnych mocy produkcyjnych w Polsce
          </div>

          <h1 className="mb-5 max-w-3xl text-4xl font-black leading-tight tracking-[-1.5px] text-white md:text-5xl lg:text-[52px]">
            Znajdź{" "}
            <span className="bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] bg-clip-text text-transparent">
              wolne moce
            </span>{" "}
            produkcyjne dla swojej firmy
          </h1>

          <p className="mb-8 max-w-[560px] text-lg leading-8 text-white/85">
            Łączymy firmy poszukujące możliwości produkcyjnych z zakładami,
            które dysponują wolnymi zdolnościami. Szybko, bezpiecznie i
            efektywnie.
          </p>

          <div className="mb-10 flex flex-wrap gap-10">
            <div>
              <div className="text-3xl font-extrabold leading-none text-white">
                500+
              </div>
              <div className="mt-1 text-sm text-white/70">Aktywnych ofert</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none text-white">
                200+
              </div>
              <div className="mt-1 text-sm text-white/70">
                Zweryfikowanych firm
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none text-white">
                50+
              </div>
              <div className="mt-1 text-sm text-white/70">
                Zrealizowanych transakcji
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href="/oferty"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] px-8 py-4 text-base font-bold text-white no-underline shadow-lg shadow-[#f59e0b]/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Przeglądaj oferty
            </a>
            <a
              href="/dodaj-oferte"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/15 px-8 py-4 text-base font-bold text-white no-underline transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <i className="fas fa-plus"></i>
              Dodaj swoją ofertę
            </a>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative rounded-[24px] border border-white/20 bg-white/10 p-7 text-white shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] text-lg font-bold">
                MP
              </div>
              <div>
                <h4 className="text-base font-bold">MetalPol Sp. z o.o.</h4>
                <p className="text-xs text-white/70">Obróbka CNC · Warszawa</p>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-white/10 p-4">
              <h5 className="mb-3 text-base font-bold">
                Obróbka CNC - wolne moce 500 szt/mies.
              </h5>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                  CNC 3-osiowy
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                  CNC 5-osiowy
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                  ISO 9001
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 text-xs text-[#fbbf24]">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
                <span className="ml-2 text-white/80">4.8 (24)</span>
              </div>
              <button className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#1a5f3c]">
                Zapytaj o ofertę
              </button>
            </div>
          </div>

          <div className="absolute -right-5 -top-5 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-slate-900 shadow-xl">
            <i className="fas fa-check flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm text-emerald-600"></i>
            <div className="text-xs text-slate-400">
              <strong className="block text-sm text-slate-900">
                Firma zweryfikowana
              </strong>
              KRS / CEIDG
            </div>
          </div>

          <div className="absolute -left-10 bottom-10 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-slate-900 shadow-xl">
            <i className="fas fa-shield-alt flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm text-emerald-600"></i>
            <div className="text-xs text-slate-400">
              <strong className="block text-sm text-slate-900">
                Gwarancja jakości
              </strong>
              System recenzji
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
