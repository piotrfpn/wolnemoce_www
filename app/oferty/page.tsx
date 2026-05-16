import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import OfferCard from "@/components/OfferCard";
import { categories, offers, provinces, services } from "@/lib/mockData";

export const metadata: Metadata = {
  title: "Oferty wolnych mocy produkcyjnych",
  description:
    "Przeglądaj statyczną listę ofert wolnych mocy produkcyjnych, magazynowych, logistycznych i technicznych w Polsce.",
};

function FilterCheckbox({ label, count }: { label: string; count: number }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-[#1a5f3c]">
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 accent-[#1a5f3c]"
        />
        {label}
      </span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
        {count}
      </span>
    </label>
  );
}

export default function OffersPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-24 pt-36 text-white">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur">
                <i className="fas fa-list-check text-[#fbbf24]"></i>
                Archiwum ofert produkcyjnych
              </div>

              <h1 className="mb-5 max-w-3xl text-4xl font-black leading-tight tracking-[-1px] md:text-5xl lg:text-[56px]">
                Znajdź dostępne moce produkcyjne w Polsce
              </h1>

              <p className="mb-8 max-w-2xl text-lg leading-8 text-white/85">
                Przeglądaj zweryfikowane oferty firm produkcyjnych,
                magazynowych, logistycznych i technicznych. Na tym etapie to
                statyczny widok MVP bez backendu.
              </p>

              <div className="grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <div className="text-3xl font-extrabold">500+</div>
                  <div className="mt-1 text-xs text-white/70">Aktywnych ofert</div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <div className="text-3xl font-extrabold">200+</div>
                  <div className="mt-1 text-xs text-white/70">
                    Zweryfikowanych firm
                  </div>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <div className="text-3xl font-extrabold">13</div>
                  <div className="mt-1 text-xs text-white/70">Branż B2B</div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="rounded-[24px] border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] text-xl font-black">
                    WM
                  </div>
                  <div>
                    <h2 className="font-bold">Szybki podgląd rynku</h2>
                    <p className="text-sm text-white/65">
                      Oferty według branż i lokalizacji
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {["CNC i metalurgia", "Wtrysk tworzyw", "Automatyka", "Logistyka 3PL"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                      >
                        <span className="text-sm font-semibold">{item}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1a5f3c]">
                          Dostępne
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="absolute -right-5 -top-5 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-slate-900 shadow-xl">
                <i className="fas fa-check h-8 w-8 rounded-full bg-emerald-50 p-2 text-center text-sm text-emerald-600"></i>
                <div className="text-xs text-slate-400">
                  <strong className="block text-sm text-slate-900">
                    Firmy zweryfikowane
                  </strong>
                  KRS / CEIDG / certyfikaty
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-20 mx-auto -mt-12 max-w-[1400px] px-6">
          <div className="rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Szukaj oferty
                </label>
                <div className="relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="text"
                    placeholder="Np. obróbka CNC, spawanie, pakowanie..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Branża
                </label>
                <div className="relative">
                  <i className="fas fa-industry absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <select
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
                  >
                    <option value="">Wszystkie branże</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Lokalizacja
                </label>
                <div className="relative">
                  <i className="fas fa-map-marker-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <select
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
                  >
                    <option value="">Cała Polska</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="mt-0 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1a5f3c] to-[#2d8a5e] px-8 text-sm font-bold text-white shadow-lg shadow-[#1a5f3c]/25 transition hover:-translate-y-0.5 hover:shadow-xl lg:mt-6">
                <i className="fas fa-search"></i>
                Szukaj
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] gap-8 px-6 py-16 lg:grid-cols-[310px_1fr]">
          <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Filtry</h2>
              <button className="text-xs font-bold text-[#1a5f3c]">
                Wyczyść
              </button>
            </div>

            <div className="space-y-7">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <i className="fas fa-layer-group text-[#1a5f3c]"></i>
                  Branża
                </h3>
                <div className="space-y-1">
                  {categories.slice(0, 6).map((category, index) => (
                    <FilterCheckbox
                      key={category}
                      label={category}
                      count={[127, 89, 28, 47, 31, 24][index]}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <i className="fas fa-map-marked-alt text-[#1a5f3c]"></i>
                  Województwo
                </h3>
                <div className="space-y-1">
                  {provinces.slice(0, 6).map((province, index) => (
                    <FilterCheckbox
                      key={province}
                      label={province}
                      count={[64, 58, 52, 41, 36, 29][index]}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <i className="fas fa-screwdriver-wrench text-[#1a5f3c]"></i>
                  Rodzaj usługi
                </h3>
                <div className="space-y-1">
                  {services.slice(0, 6).map((service, index) => (
                    <FilterCheckbox
                      key={service}
                      label={service}
                      count={[76, 48, 32, 44, 29, 24][index]}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-[#0d3d26] to-[#1a5f3c] p-5 text-white">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <i className="fas fa-plus"></i>
                </div>
                <h3 className="mb-2 font-bold">Masz wolne moce?</h3>
                <p className="mb-4 text-sm leading-6 text-white/75">
                  Dodaj ofertę i pokaż swoją dostępność firmom szukającym
                  podwykonawców.
                </p>
                <Link
                  href="/dodaj-oferte"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#1a5f3c]"
                >
                  Dodaj ofertę
                  <i className="fas fa-arrow-right text-xs"></i>
                </Link>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Znaleziono</p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {offers.length} ofert produkcyjnych
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="text-sm font-semibold text-slate-500">
                  Sortuj:
                </span>
                <select
                  defaultValue="recommended"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
                >
                  <option value="recommended">Rekomendowane</option>
                  <option value="newest">Najnowsze</option>
                  <option value="premium">Wyróżnione najpierw</option>
                  <option value="rating">Najwyżej oceniane</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>

            <div className="mt-10 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1a5f3c] shadow-sm">
                <i className="fas fa-circle-info text-xl"></i>
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-slate-900">
                To jest statyczna wersja MVP
              </h3>
              <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-500">
                Filtry, sortowanie i przyciski są teraz tylko warstwą UI. W
                kolejnych iteracjach można dodać szczegóły pojedynczej oferty,
                formularz RFQ oraz dynamiczne dane.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
