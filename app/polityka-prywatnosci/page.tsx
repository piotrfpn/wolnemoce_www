import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: "Polityka prywatności | WolneMoce.pl",
  description: "Roboczy szkic polityki prywatności portalu WolneMoce.pl.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Dokument roboczy"
          title="Polityka prywatności"
          description="Poniższa treść jest szkicem do MVP i wymaga weryfikacji prawnej przed publikacją produkcyjną."
          icon="fas fa-user-shield"
        />

        <section className="section">
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <strong>Uwaga:</strong> treść polityki prywatności jest robocza i
            wymaga weryfikacji prawnej.
          </div>

          <div className="mt-8 space-y-6 rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
            {[
              ["1. Administrator danych", "Docelowe dane administratora zostaną uzupełnione przed uruchomieniem wersji produkcyjnej."],
              ["2. Zakres danych", "W statycznym MVP formularze nie wysyłają danych i nie zapisują informacji użytkownika."],
              ["3. Cel przetwarzania", "W przyszłej wersji dane mogą służyć do obsługi zapytań, publikacji ofert i kontaktu B2B."],
              ["4. Pliki cookies", "Szczegółowe informacje o cookies zostaną opisane po decyzji o narzędziach analitycznych."],
              ["5. Prawa użytkownika", "Użytkownik będzie miał prawo dostępu, sprostowania i usunięcia danych zgodnie z obowiązującymi przepisami."],
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
