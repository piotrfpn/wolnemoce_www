import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import OfferCard from "@/components/OfferCard";
import StaticFormField from "@/components/StaticFormField";
import { offers } from "@/lib/mockData";

type OfferDetailsPageProps = {
  params: {
    slug: string;
  };
};

export const dynamicParams = false;

function getOffer(slug: string) {
  return offers.find((offer) => offer.slug === slug);
}

function truncateDescription(description: string, maxLength = 155) {
  if (description.length <= maxLength) {
    return description;
  }

  const trimmed = description.slice(0, maxLength - 1).trimEnd();
  return `${trimmed}…`;
}

function getSimilarOffers(currentSlug: string) {
  const currentOffer = getOffer(currentSlug);

  if (!currentOffer) {
    return [];
  }

  const sameCategory = offers.filter(
    (offer) =>
      offer.slug !== currentSlug && offer.category === currentOffer.category
  );
  const otherOffers = offers.filter(
    (offer) =>
      offer.slug !== currentSlug && offer.category !== currentOffer.category
  );

  return [...sameCategory, ...otherOffers].slice(0, 3);
}

export function generateStaticParams() {
  return offers.map((offer) => ({
    slug: offer.slug,
  }));
}

export function generateMetadata({
  params,
}: OfferDetailsPageProps): Metadata {
  const offer = getOffer(params.slug);

  if (!offer) {
    return {
      title: "Oferta nie znaleziona | WolneMoce.pl",
    };
  }

  return {
    title: `${offer.title} | ${offer.company} | WolneMoce.pl`,
    description: truncateDescription(offer.description),
  };
}

export default function OfferDetailsPage({ params }: OfferDetailsPageProps) {
  const offer = getOffer(params.slug);

  if (!offer) {
    notFound();
  }

  const similarOffers = getSimilarOffers(offer.slug);

  const parameters = [
    ["Firma", offer.company, "fas fa-building"],
    ["Lokalizacja", offer.location, "fas fa-location-dot"],
    ["Województwo", offer.province, "fas fa-map"],
    ["Branża", offer.category, "fas fa-industry"],
    ["Rodzaj usługi", offer.service, "fas fa-cogs"],
    ["Dostępna moc", offer.capacity, "fas fa-chart-bar"],
    ["Termin realizacji", offer.leadTime, "fas fa-clock"],
    ["Minimalne zamówienie", offer.minimumOrder ?? "Do ustalenia", "fas fa-boxes-stacked"],
  ];

  return (
    <>
      <Navbar />

      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-16 pt-36 text-white md:pb-20">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

          <div className="relative z-10 mx-auto grid max-w-[1400px] min-w-0 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="min-w-0">
              <Link
                href="/oferty"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 no-underline transition hover:text-white"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                Wróć do ofert
              </Link>

              <div className="mb-5 flex flex-wrap gap-3">
                {offer.isPremium && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f59e0b] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                    <i className="fas fa-crown"></i>
                    Premium
                  </span>
                )}
                {offer.isVerified && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                    <i className="fas fa-check-circle text-[#fbbf24]"></i>
                    Zweryfikowana firma
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-[-1px] md:text-5xl">
                {offer.title}
              </h1>

              <div className="mt-6 flex flex-col gap-4 text-white/85 sm:flex-row sm:flex-wrap sm:items-center">
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <i className="fas fa-building text-[#fbbf24]"></i>
                  {offer.company}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <i className="fas fa-map-marker-alt text-[#fbbf24]"></i>
                  {offer.location}, {offer.province}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <i className="fas fa-star text-[#fbbf24]"></i>
                  {offer.rating} ({offer.reviews} opinii)
                </span>
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-[24px] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
              <img
                src={offer.image}
                alt={offer.imageAlt}
                className="h-[260px] w-full max-w-full rounded-[18px] object-cover md:h-[360px]"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] min-w-0 gap-8 px-6 py-16 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-8">
            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#1a5f3c]">
                  <i className="fas fa-list-check"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Parametry oferty
                  </h2>
                  <p className="text-sm text-slate-500">
                    Najważniejsze informacje do wstępnej kwalifikacji.
                  </p>
                </div>
              </div>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                {parameters.map(([label, value, icon]) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <i className={`${icon} text-[#1a5f3c]`}></i>
                      {label}
                    </div>
                    <p className="break-words text-sm font-extrabold text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
                Opis możliwości produkcyjnych
              </h2>
              <p className="text-base leading-8 text-slate-600">
                {offer.description}
              </p>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                Certyfikaty i weryfikacja
              </h2>
              <div className="flex flex-wrap gap-3">
                {offer.certifications.map((certification) => (
                  <span
                    key={certification}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"
                  >
                    <i className="fas fa-shield-alt"></i>
                    {certification}
                  </span>
                ))}
                {offer.isVerified && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                    <i className="fas fa-check-circle text-[#1a5f3c]"></i>
                    Status zweryfikowany
                  </span>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                O firmie
              </h2>
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-sm"
                  style={{ background: offer.companyGradient }}
                >
                  {offer.companyInitials}
                </div>
                <div className="min-w-0">
                  <h3 className="break-words text-xl font-extrabold text-slate-900">
                    {offer.company}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {offer.companyMeta}. Firma prezentuje dostępne moce w
                    kategorii {offer.category} i obsługuje zapytania B2B w
                    modelu statycznego MVP.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="min-w-0">
            <form className="sticky top-24 rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Zapytaj o ofertę
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Formularz RFQ jest statyczny i nie wysyła danych.
                </p>
              </div>

              <div className="space-y-4">
                <StaticFormField label="Imię i nazwisko" name="name" icon="fas fa-user" />
                <StaticFormField label="Firma" name="company" icon="fas fa-building" />
                <StaticFormField label="Email" name="email" type="email" icon="fas fa-envelope" />
                <StaticFormField label="Telefon" name="phone" type="tel" icon="fas fa-phone" />
                <StaticFormField label="Ilość / zakres zamówienia" name="quantity" icon="fas fa-boxes-stacked" />
                <StaticFormField label="Termin realizacji" name="deadline" icon="fas fa-clock" />
                <StaticFormField
                  label="Wiadomość"
                  name="message"
                  textarea
                  rows={5}
                  placeholder="Opisz krótko zapotrzebowanie, materiał, ilość i oczekiwany termin."
                  icon="fas fa-message"
                />
              </div>

              <button type="button" className="mt-6 w-full btn btn-primary">
                Wyślij zapytanie
              </button>
            </form>
          </aside>
        </section>

        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="section-label">Podobne oferty</div>
                <h2 className="section-title">Sprawdź też inne moce</h2>
              </div>
              <Link href="/oferty" className="btn btn-outline">
                Wszystkie oferty
              </Link>
            </div>

            <div className="grid min-w-0 gap-6 lg:grid-cols-3">
              {similarOffers.map((similarOffer) => (
                <OfferCard key={similarOffer.id} offer={similarOffer} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-[1400px] rounded-[24px] bg-gradient-to-br from-[#0d3d26] to-[#1a5f3c] p-8 text-center text-white md:p-12">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Masz podobne wolne moce?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80">
              Dodaj statyczną ofertę MVP albo skontaktuj się, jeśli chcesz
              omówić prezentację swojej firmy na WolneMoce.pl.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/dodaj-oferte" className="btn btn-accent">
                Dodaj ofertę
              </Link>
              <Link href="/kontakt" className="btn btn-outline bg-white text-[#1a5f3c]">
                Kontakt
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
