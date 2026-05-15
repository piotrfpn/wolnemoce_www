import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: "Jak to działa | WolneMoce.pl",
  description:
    "Zobacz, jak WolneMoce.pl łączy firmy szukające podwykonawców z firmami posiadającymi wolne moce.",
};

const buyerSteps = [
  "Opisz zapotrzebowanie produkcyjne",
  "Przejrzyj pasujące oferty",
  "Skontaktuj się z wybraną firmą",
  "Uzgodnij zakres i rozpocznij współpracę",
];

const supplierSteps = [
  "Dodaj profil firmy i ofertę",
  "Pokaż dostępne moce oraz certyfikaty",
  "Odbieraj zapytania od firm B2B",
  "Wypełniaj wolne terminy produkcyjne",
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      <main>
        <PageHero
          label="Proces współpracy"
          title="Jedno miejsce dla firm szukających wykonawców i firm z wolnymi mocami"
          description="Statyczny proces MVP pokazuje, jak docelowo portal będzie skracał drogę od potrzeby produkcyjnej do sprawdzonego partnera B2B."
          icon="fas fa-route"
          actions={
            <>
              <a href="/oferty" className="btn btn-accent">
                Przeglądaj oferty <i className="fas fa-arrow-right"></i>
              </a>
              <a href="/dodaj-oferte" className="btn btn-outline bg-white text-[#1a5f3c]">
                Dodaj ofertę
              </a>
            </>
          }
        />

        <section className="section">
          <div className="section-header fade-in visible">
            <div className="section-label">Dwie strony rynku</div>
            <h2 className="section-title">Proces dopasowany do roli firmy</h2>
            <p className="section-desc">
              WolneMoce.pl porządkuje komunikację między zleceniodawcą a firmą,
              która może szybko przyjąć dodatkową pracę.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-[#1a5f3c]">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="mb-4 text-2xl font-extrabold text-slate-900">
                Firma szukająca podwykonawcy
              </h3>
              <div className="space-y-4">
                {buyerSteps.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a5f3c] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-[#f59e0b]">
                <i className="fas fa-industry"></i>
              </div>
              <h3 className="mb-4 text-2xl font-extrabold text-slate-900">
                Firma posiadająca wolne moce
              </h3>
              <div className="space-y-4">
                {supplierSteps.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a5f3c] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto grid max-w-[1400px] gap-6 md:grid-cols-3">
            {[
              ["fas fa-clock", "Szybsze decyzje", "Oferty i parametry są zebrane w jednym miejscu."],
              ["fas fa-shield-alt", "Weryfikacja", "Profil firmy, dane rejestrowe i certyfikaty budują zaufanie."],
              ["fas fa-handshake", "Kontakt B2B", "Portal wspiera rozpoczęcie rozmowy między firmami."],
            ].map(([icon, title, text]) => (
              <div key={title} className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-sm">
                <i className={`${icon} mb-5 text-3xl text-[#1a5f3c]`}></i>
                <h3 className="mb-3 text-xl font-extrabold text-slate-900">{title}</h3>
                <p className="text-sm leading-7 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="rounded-[24px] bg-gradient-to-br from-[#0d3d26] to-[#1a5f3c] p-8 text-white md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h2 className="mb-4 text-3xl font-extrabold md:text-4xl">
                  Bezpieczeństwo i weryfikacja
                </h2>
                <p className="text-base leading-8 text-white/80">
                  Wersja MVP pokazuje docelową ścieżkę: dane firmy, certyfikaty,
                  zakres możliwości i jasny kontakt. Pełna automatyzacja
                  weryfikacji nie jest częścią tego sprintu.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {["KRS / CEIDG", "Certyfikaty", "Profil firmy", "Historia współpracy"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
