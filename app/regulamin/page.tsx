import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: "Regulamin | WolneMoce.pl",
  description: "Roboczy szkic regulaminu portalu WolneMoce.pl.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Dokument roboczy"
          title="Regulamin WolneMoce.pl"
          description="Poniższa treść jest szkicem do MVP i wymaga weryfikacji prawnej przed publikacją produkcyjną."
          icon="fas fa-file-contract"
        />

        <section className="section">
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <strong>Uwaga:</strong> treść regulaminu jest robocza i nie stanowi
            gotowej dokumentacji prawnej.
          </div>

          <div className="mt-8 space-y-6 rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
            {[
              ["1. Postanowienia ogólne", "Portal WolneMoce.pl prezentuje oferty firm posiadających wolne moce produkcyjne, logistyczne, magazynowe lub techniczne."],
              ["2. Charakter usług", "Wersja MVP ma charakter informacyjny i statyczny. Formularze oraz przyciski nie realizują procesów transakcyjnych."],
              ["3. Oferty", "Treści ofert powinny być zgodne ze stanem faktycznym i nie mogą naruszać praw osób trzecich."],
              ["4. Kontakt między firmami", "Docelowo portal może ułatwiać kontakt B2B, ale warunki współpracy ustalają bezpośrednio zainteresowane firmy."],
              ["5. Zmiany regulaminu", "Treść zostanie uzupełniona po konsultacji prawnej i przed wdrożeniem funkcji produkcyjnych."],
            ].map(([title, text]) => (
              <section key={title}>
                <h2 className="mb-2 text-xl font-extrabold text-slate-900">{title}</h2>
                <p className="text-sm leading-7 text-slate-500">{text}</p>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
