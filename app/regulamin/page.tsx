import type { Metadata } from "next";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Regulamin Serwisu",
  description:
    "Regulamin portalu WolneMoce.pl dla marketplace B2B wolnych mocy produkcyjnych, magazynowych, logistycznych i technicznych.",
};

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-slate-900">
        {number}. {title}
      </h2>
      <div className="space-y-4 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Dokument prawny"
          title="Regulamin Serwisu WolneMoce.pl"
          description="Zasady korzystania z portalu B2B dla firm szukających i oferujących wolne moce produkcyjne, magazynowe, logistyczne i techniczne."
          icon="fas fa-file-contract"
        />

        <section className="section">
          <article className="mx-auto max-w-4xl rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
              <strong>Wersja MVP / beta.</strong> Dokument powinien zostać
              zweryfikowany przez profesjonalnego prawnika przed pełnym
              publicznym uruchomieniem komercyjnym.
            </div>

            <div className="space-y-10">
              <Section number={1} title="Definicje">
                <p>
                  <strong>Serwis</strong> oznacza portal internetowy WolneMoce.pl,
                  umożliwiający prezentowanie i wyszukiwanie wolnych mocy B2B.
                  <strong> Operator</strong> oznacza podmiot prowadzący Serwis.
                  <strong> Użytkownik</strong> oznacza przedsiębiorcę albo osobę
                  działającą w imieniu przedsiębiorcy. <strong>Oferta</strong>
                  oznacza informację o dostępnych mocach produkcyjnych,
                  magazynowych, logistycznych lub technicznych. <strong>RFQ</strong>
                  oznacza zapytanie ofertowe kierowane do firmy przez Serwis.
                </p>
              </Section>

              <Section number={2} title="Dane Operatora">
                <ul className="list-disc space-y-2 pl-5">
                  <li>Pełne dane firmy: [Wpisz_Pelne_Dane_Firmy]</li>
                  <li>NIP: [Wpisz_NIP]</li>
                  <li>REGON: [Wpisz_REGON]</li>
                  <li>Adres: [Wpisz_Adres]</li>
                  <li>Email kontaktowy: [Wpisz_Email_Kontaktowy]</li>
                  <li>Email reklamacje: [Wpisz_Email_Reklamacje]</li>
                </ul>
              </Section>

              <Section number={3} title="Charakter portalu i zakres usług">
                <p>
                  Serwis jest narzędziem B2B typu marketplace/SaaS służącym do
                  publikacji profili firm, ofert wolnych mocy oraz obsługi
                  zapytań RFQ. Serwis nie jest stroną umów zawieranych między
                  firmami i nie świadczy usług produkcyjnych, logistycznych,
                  magazynowych ani technicznych we własnym imieniu.
                </p>
              </Section>

              <Section number={4} title="Przeznaczenie wyłącznie B2B">
                <p>
                  Portal jest przeznaczony wyłącznie dla przedsiębiorców
                  działających w celu zawodowym lub gospodarczym. Użytkownik
                  oświadcza, że korzysta z portalu w charakterze profesjonalnym
                  i zawodowym. Portal nie jest kierowany do konsumentów. Jeżeli
                  osoba nie działa w celu zawodowym lub gospodarczym, nie powinna
                  zakładać konta. Postanowienia dotyczące wyłączeń stosuje się w
                  zakresie dopuszczalnym przez bezwzględnie obowiązujące przepisy
                  prawa.
                </p>
              </Section>

              <Section number={5} title="Rejestracja konta">
                <p>
                  Rejestracja wymaga podania danych umożliwiających utworzenie
                  konta oraz akceptacji Regulaminu. Użytkownik odpowiada za
                  prawdziwość danych podanych przy rejestracji i za uprawnienie do
                  działania w imieniu wskazanej firmy.
                </p>
              </Section>

              <Section number={6} title="Konto użytkownika i bezpieczeństwo logowania">
                <p>
                  Użytkownik zobowiązuje się chronić dane dostępowe do konta i
                  nie udostępniać ich osobom nieuprawnionym. Operator może
                  ograniczyć dostęp do konta w razie podejrzenia naruszenia
                  bezpieczeństwa, nadużycia albo korzystania z konta niezgodnie z
                  Regulaminem.
                </p>
              </Section>

              <Section number={7} title="Profil firmy">
                <p>
                  Profil firmy może obejmować między innymi nazwę firmy, NIP,
                  REGON, opis działalności, adres strony WWW, lokalizację,
                  branże, rodzaje usług i status weryfikacji. Użytkownik odpowiada
                  za aktualność i zgodność tych danych ze stanem faktycznym.
                </p>
              </Section>

              <Section number={8} title="Branże i rodzaje usług">
                <p>
                  Słowniki branż i usług służą uporządkowaniu ofert. Użytkownik
                  może zgłosić brakującą usługę do administratora. Zgłoszenie ma
                  status oczekujący i nie powoduje automatycznego dodania usługi
                  do słownika.
                </p>
              </Section>

              <Section number={9} title="Dodawanie i moderacja ofert">
                <p>
                  Użytkownik może dodawać, edytować i usuwać własne oferty w
                  panelu firmy. Oferta może wymagać moderacji przez Operatora
                  przed publikacją. Operator może odmówić publikacji albo usunąć
                  ofertę, jeżeli narusza Regulamin, prawo, prawa osób trzecich
                  albo zasady rzetelnej komunikacji B2B.
                </p>
              </Section>

              <Section number={10} title="Statusy ofert">
                <ul className="list-disc space-y-2 pl-5">
                  <li><strong>draft</strong> - szkic widoczny dla właściciela firmy.</li>
                  <li><strong>pending</strong> - oferta oczekująca na moderację.</li>
                  <li><strong>active</strong> - oferta aktywna i widoczna publicznie.</li>
                  <li><strong>rejected</strong> - oferta odrzucona przez administratora.</li>
                  <li>Operator może w przyszłości dodać inne statusy techniczne lub biznesowe.</li>
                </ul>
              </Section>

              <Section number={11} title="Zapytania ofertowe RFQ">
                <p>
                  RFQ umożliwia osobie zainteresowanej wysłanie zapytania do
                  firmy posiadającej aktywną ofertę. Dane zapytania trafiają do
                  panelu firmy. Serwis nie gwarantuje odpowiedzi, zawarcia umowy,
                  warunków handlowych ani realizacji zlecenia.
                </p>
              </Section>

              <Section number={12} title="Załączniki RFQ i prywatne pliki">
                <p>
                  Użytkownik wysyłający RFQ może dołączyć pliki, takie jak
                  rysunki, zdjęcia, specyfikacje lub dokumenty techniczne.
                  Załączniki RFQ są przechowywane w prywatnym bucketcie Supabase
                  Storage. Użytkownik odpowiada za legalność przekazania plików i
                  za to, aby nie zawierały danych lub tajemnic, których nie ma
                  prawa udostępnić.
                </p>
              </Section>

              <Section number={13} title="Signed URLs">
                <p>
                  Dostęp do prywatnych załączników może być realizowany przez
                  czasowe signed URLs. Taki link ma ograniczony czas ważności i
                  nie powinien być przekazywany osobom nieuprawnionym. Operator
                  nie odpowiada za ujawnienie pliku, jeżeli uprawniony użytkownik
                  sam przekaże link dalej.
                </p>
              </Section>

              <Section number={14} title="Prezentacje firmowe PDF/PPT/PPTX w prywatnym Storage">
                <p>
                  Firma może dodać prezentację firmową w formacie PDF, PPT albo
                  PPTX. Pliki prezentacji są przechowywane w prywatnym Storage,
                  a w profilu firmy przechowywane są ścieżka i metadane pliku.
                  Publiczne udostępnianie lub pobieranie prezentacji może zostać
                  wdrożone jako odrębna funkcja.
                </p>
              </Section>

              <Section number={15} title="Panel administratora i moderacja">
                <p>
                  Administrator może moderować oferty, firmy oraz zgłoszenia usług.
                  Moderacja może obejmować zatwierdzanie, odrzucanie, ukrywanie
                  lub ograniczanie widoczności treści oraz weryfikację profili
                  firm.
                </p>
              </Section>

              <Section number={16} title="Zgłaszanie naruszeń / notice and takedown / notice and action">
                <p>
                  Użytkownik lub osoba trzecia może zgłosić treści bezprawne,
                  naruszające prawa osób trzecich, poufność, prawa autorskie,
                  tajemnicę przedsiębiorstwa albo Regulamin. Zgłoszenie powinno
                  zawierać opis naruszenia, URL lub identyfikację treści, dane
                  zgłaszającego oraz uzasadnienie.
                </p>
                <p>
                  Po uzyskaniu wiarygodnej informacji Operator może tymczasowo
                  ukryć, ograniczyć lub usunąć treść, a w przypadku rażących lub
                  powtarzających się naruszeń także zablokować konto.
                </p>
              </Section>

              <Section number={17} title="Płatności, subskrypcje i Stripe">
                <p>
                  Docelowy model Serwisu może obejmować odpłatne plany B2B SaaS
                  lub abonament miesięczny. Subskrypcja może odnawiać się
                  automatycznie. Płatności mogą być obsługiwane przez Stripe jako
                  zewnętrznego operatora płatności. Operator może wystawiać
                  faktury elektroniczne.
                </p>
              </Section>

              <Section number={18} title="Anulowanie subskrypcji i brak proporcjonalnych zwrotów">
                <p>
                  Użytkownik może anulować subskrypcję w dowolnym momencie, ze
                  skutkiem na koniec opłaconego okresu rozliczeniowego. Użytkownik
                  może korzystać z konta do końca opłaconego okresu. O ile
                  bezwzględnie obowiązujące przepisy prawa nie stanowią inaczej,
                  Operator nie dokonuje proporcjonalnych zwrotów za niewykorzystane
                  dni okresu rozliczeniowego.
                </p>
              </Section>

              <Section number={19} title="Zawieszenie konta przy braku płatności lub naruszeniu regulaminu">
                <p>
                  Operator może zawiesić lub ograniczyć dostęp do płatnych funkcji
                  w przypadku braku płatności, błędu płatności, cofnięcia płatności
                  albo naruszenia Regulaminu. Ograniczenie może dotyczyć między
                  innymi publikowania ofert, widoczności profilu lub dostępu do
                  wybranych funkcji panelu.
                </p>
              </Section>

              <Section number={20} title="Odpowiedzialność użytkowników">
                <p>
                  Użytkownicy odpowiadają za treści ofert, dane profili, treść RFQ,
                  załączniki, legalność dokumentacji technicznej oraz działania
                  podejmowane poza Serwisem. Umowy produkcyjne, usługowe,
                  logistyczne lub handlowe są zawierane bezpośrednio między
                  użytkownikami poza portalem.
                </p>
              </Section>

              <Section number={21} title="Wyłączenia odpowiedzialności Operatora">
                <p>
                  Operator nie gwarantuje zawarcia umowy, jakości usług,
                  wypłacalności firm, terminowości, dostępności mocy, kompletności
                  ofert ani realizacji zleceń. Operator nie jest stroną relacji
                  handlowej między użytkownikami i nie odpowiada za ich wzajemne
                  rozliczenia, z zastrzeżeniem przepisów bezwzględnie
                  obowiązujących.
                </p>
              </Section>

              <Section number={22} title="Dostępność techniczna i przerwy serwisowe">
                <p>
                  Operator dokłada starań, aby Serwis działał stabilnie, ale nie
                  gwarantuje nieprzerwanej dostępności. Możliwe są przerwy
                  techniczne, prace serwisowe, awarie infrastruktury dostawców lub
                  ograniczenia wynikające z bezpieczeństwa.
                </p>
              </Section>

              <Section number={23} title="Reklamacje">
                <p>
                  Reklamacje dotyczące działania Serwisu można kierować na adres
                  [Wpisz_Email_Reklamacje]. Reklamacja powinna zawierać opis
                  problemu, dane zgłaszającego, identyfikację konta lub treści oraz
                  oczekiwany sposób rozpatrzenia.
                </p>
              </Section>

              <Section number={24} title="Zmiany regulaminu">
                <p>
                  Operator może zmienić Regulamin w szczególności w razie rozwoju
                  Serwisu, wdrożenia płatności, zmian prawnych, zmian technicznych
                  lub potrzeby doprecyzowania zasad bezpieczeństwa i moderacji.
                </p>
              </Section>

              <Section number={25} title="Prawo właściwe i sąd właściwy">
                <p>
                  Regulamin podlega prawu polskiemu. Spory będą rozstrzygane przez
                  sąd właściwy zgodnie z bezwzględnie obowiązującymi przepisami
                  prawa oraz właściwością stron.
                </p>
              </Section>

              <Section number={26} title="Postanowienia końcowe">
                <p>
                  W sprawach nieuregulowanych Regulaminem stosuje się przepisy
                  prawa powszechnie obowiązującego. Jeżeli którekolwiek
                  postanowienie okaże się nieważne, pozostałe postanowienia
                  pozostają w mocy w zakresie dopuszczalnym prawem.
                </p>
              </Section>
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
