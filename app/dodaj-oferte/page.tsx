import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Dodaj ofertę",
  description:
    "Dodaj ofertę wolnych mocy produkcyjnych po utworzeniu konta firmy w WolneMoce.pl.",
};

const steps = [
  {
    icon: "fas fa-user-plus",
    title: "Załóż konto",
    description: "Utwórz darmowe konto firmowe albo zaloguj się do istniejącego panelu.",
  },
  {
    icon: "fas fa-building",
    title: "Uzupełnij profil firmy",
    description: "Dodaj podstawowe dane firmy, branże oraz rodzaje usług.",
  },
  {
    icon: "fas fa-clipboard-list",
    title: "Dodaj ofertę",
    description: "Opisz dostępne moce, terminy realizacji i minimalne zamówienie.",
  },
  {
    icon: "fas fa-shield-alt",
    title: "Poczekaj na zatwierdzenie",
    description: "Administrator sprawdzi ofertę przed jej publikacją.",
  },
  {
    icon: "fas fa-bullhorn",
    title: "Oferta pojawi się publicznie",
    description: "Po akceptacji oferta będzie widoczna na publicznej liście ofert.",
  },
];

export default function AddOfferPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Dodaj ofertę"
          title="Dodaj ofertę"
          description="Aby dodać ofertę swoich wolnych mocy produkcyjnych, utwórz darmowe konto firmy lub zaloguj się do panelu."
          icon="fas fa-plus"
        />

        <section className="section">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                <i className="fas fa-industry text-xl"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Dodawanie ofert odbywa się w panelu firmy
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Dzięki temu oferta jest powiązana z profilem firmy, może przejść weryfikację
                administratora i później trafić do publicznej listy ofert.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/rejestracja?next=/panel/oferty/nowa" className="btn btn-primary">
                  Utwórz konto
                </Link>
                <Link
                  href="/logowanie?next=/panel/oferty/nowa"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline transition hover:bg-[#1a5f3c] hover:text-white"
                >
                  Zaloguj się
                </Link>
              </div>

              <Link
                href="/oferty"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1a5f3c] no-underline"
              >
                Zobacz oferty
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>

            <div className="grid min-w-0 gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex min-w-0 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                    <i className={`${step.icon} text-base`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Krok {index + 1}
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
