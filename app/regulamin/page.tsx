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
              zweryfikowany przez profesjonalnego prawnika albo partnera
              prawno-księgowego Credos przed pełnym publicznym uruchomieniem
              komercyjnym.
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
                  publikacji profili firm, prezentacji ofert wolnych mocy
                  produkcyjnych, magazynowych, logistycznych i technicznych oraz
                  obsługi zapytań RFQ. Serwis ułatwia nawiązanie kontaktu
                  biznesowego między firmami, ale nie świadczy usług
                  produkcyjnych, logistycznych, magazynowych ani technicznych we
                  własnym imieniu.
                </p>
                <p>
                  WolneMoce.pl nie gwarantuje pozyskania zapytania, zlecenia,
                  zawarcia umowy ani osiągnięcia określonego wyniku
                  sprzedażowego. Widoczność w Serwisie, aktywny profil, aktywna
                  oferta, wyróżnienie albo korzystanie z płatnego planu nie
                  oznaczają gwarancji zainteresowania ze strony innych firm.
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
                <p>
                  Kliknięcie przycisku „Dodaj ofertę”, „Zapisz ofertę”, „Wyślij
                  do publikacji” albo podobnej akcji nie oznacza automatycznej
                  publikacji oferty na publicznych stronach Serwisu. Dodanie
                  oferty oznacza zapisanie jej, zgłoszenie do weryfikacji lub
                  przekazanie do procesu publikacji zgodnie z aktualnym
                  działaniem platformy.
                </p>
              </Section>

              <Section number={10} title="Statusy ofert">
                <ul className="list-disc space-y-2 pl-5">
                  <li><strong>draft</strong> - wersja robocza widoczna dla właściciela firmy.</li>
                  <li><strong>pending</strong> - oferta oczekuje na weryfikację lub publikację.</li>
                  <li><strong>active</strong> - oferta publiczna i widoczna w Serwisie.</li>
                  <li><strong>rejected</strong> - oferta odrzucona przez administratora.</li>
                  <li><strong>archived</strong> - oferta archiwalna lub wycofana.</li>
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
                <p>
                  Administrator może w szczególności zaakceptować ofertę, odrzucić
                  ją, zarchiwizować, ukryć, zmienić jej status, odmówić publikacji
                  oferty niespełniającej standardów platformy, poprosić
                  użytkownika o poprawienie treści albo usunąć lub ukryć materiały
                  naruszające zasady Serwisu.
                </p>
              </Section>

              <Section number={16} title="WolneMoce.pl nie jest stroną umowy produkcyjnej">
                <p>
                  WolneMoce.pl jest dostawcą infrastruktury teleinformatycznej i
                  platformą kojarzącą firmy B2B. Serwis nie jest stroną umowy
                  zawieranej między zleceniodawcą i wykonawcą albo podwykonawcą.
                </p>
                <p>Strony samodzielnie ustalają w szczególności:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>zakres prac, ceny, terminy i warunki techniczne,</li>
                  <li>odpowiedzialność, gwarancje, reklamacje i odbiory,</li>
                  <li>płatności, dokumentację, transport i logistykę,</li>
                  <li>inne warunki współpracy wymagane dla danego zlecenia.</li>
                </ul>
                <p>
                  Operator nie odpowiada za jakość wykonania detali lub usług,
                  wady produktów, opóźnienia, rozliczenia między firmami, brak
                  płatności między stronami, błędne ustalenia techniczne ani spory
                  wynikające z realizacji umowy zawartej poza Serwisem.
                </p>
              </Section>

              <Section number={17} title="Plany, wyróżnienia i dodatki płatne">
                <p>
                  Serwis może udostępniać plany FREE, PRO i ENTERPRISE. Szczegółowy
                  zakres planów, limity, funkcje i ceny są prezentowane w cenniku
                  na stronie i mogą być aktualizowane wraz z rozwojem Serwisu.
                </p>
                <p>
                  Plan PRO nie obejmuje automatycznie usług księgowych, prawnych
                  ani doradczych partnerów usługowych. Usługi partnerskie,
                  wyróżnienia ofert, reklama branżowa i inne dodatki mogą być
                  oferowane jako płatne osobno albo na podstawie indywidualnych
                  ustaleń.
                </p>
                <p>
                  Wyróżnienie oferty zwiększa jej widoczność w Serwisie, ale nie
                  gwarantuje zapytań, zleceń ani sprzedaży. Administrator może
                  ręcznie ustawić wyróżnienie oferty, w szczególności w ramach
                  testów, promocji, indywidualnej umowy albo obsługi klienta.
                </p>
              </Section>

              <Section number={18} title="Usługi partnerskie">
                <p>
                  WolneMoce.pl może prezentować płatne usługi partnerów
                  usługowych. Credos może świadczyć wsparcie księgowo-prawne, a
                  LogiMarket może świadczyć doradztwo procesowe i doradztwo w
                  zakresie łańcucha dostaw.
                </p>
                <p>
                  Usługi partnerskie nie są automatycznie zawarte w planie FREE
                  ani PRO. Wymagają osobnego ustalenia zakresu, ceny, terminu i
                  warunków realizacji. Szczegółowe warunki mogą być ustalane
                  bezpośrednio z właściwym partnerem.
                </p>
                <p>
                  WolneMoce.pl może przekazać dane kontaktowe partnerowi wyłącznie
                  w związku z zapytaniem użytkownika dotyczącym danej usługi
                  partnerskiej albo za zgodą użytkownika, w zakresie potrzebnym do
                  obsługi zapytania.
                </p>
              </Section>

              <Section number={19} title="Zasady treści ofert i zakaz obchodzenia platformy">
                <p>
                  Użytkownik nie może publikować w treści oferty, zdjęciach,
                  grafikach, nazwach plików, materiałach ani innych elementach
                  oferty danych lub elementów służących bezpośredniemu obchodzeniu
                  komunikacji przez platformę.
                </p>
                <p>Zakaz obejmuje w szczególności:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>numery telefonów i adresy e-mail,</li>
                  <li>adresy stron internetowych służących do kontaktu poza platformą,</li>
                  <li>linki do zewnętrznych formularzy kontaktowych,</li>
                  <li>kody QR, dane handlowców, komunikatory i podobne identyfikatory,</li>
                  <li>treści typu „skontaktuj się bezpośrednio pod...”.</li>
                </ul>
                <p>
                  Celem tych zasad jest utrzymanie jakości i bezpieczeństwa
                  komunikacji, zapewnienie spójnej obsługi zapytań, ochrona modelu
                  działania marketplace oraz zapobieganie obchodzeniu mechanizmów
                  platformy. Administrator może edytować treść oferty w celu
                  usunięcia bezpośrednich danych kontaktowych, ukryć ofertę,
                  wstrzymać jej publikację, zmienić status oferty na
                  pending/rejected/archived albo poprosić użytkownika o poprawienie
                  oferty.
                </p>
              </Section>

              <Section number={20} title="Zdjęcia, grafiki i materiały ofertowe">
                <p>
                  Zdjęcia i materiały graficzne dodawane do ofert powinny
                  przedstawiać maszyny, park maszynowy, hale, stanowiska,
                  przykładowe realizacje lub inne materiały bezpośrednio związane
                  z ofertą.
                </p>
                <p>
                  Zdjęcia, grafiki i inne materiały nie powinny zawierać danych
                  kontaktowych ani elementów służących obejściu komunikacji przez
                  platformę. Administrator może ukryć, usunąć albo poprosić o
                  zmianę materiałów, jeśli naruszają Regulamin, prawo, prawa osób
                  trzecich lub zasady jakości Serwisu.
                </p>
              </Section>

              <Section number={21} title="Zgłaszanie naruszeń / notice and takedown / notice and action">
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

              <Section number={22} title="Płatności, subskrypcje i Stripe">
                <p>
                  Docelowy model Serwisu może obejmować odpłatne plany B2B SaaS
                  lub abonament miesięczny. Subskrypcja może odnawiać się
                  automatycznie. Płatności mogą być obsługiwane przez Stripe jako
                  zewnętrznego operatora płatności. Operator może wystawiać
                  faktury elektroniczne.
                </p>
              </Section>

              <Section number={23} title="Anulowanie subskrypcji i brak proporcjonalnych zwrotów">
                <p>
                  Użytkownik może anulować subskrypcję w dowolnym momencie, ze
                  skutkiem na koniec opłaconego okresu rozliczeniowego. Użytkownik
                  może korzystać z konta do końca opłaconego okresu. O ile
                  bezwzględnie obowiązujące przepisy prawa nie stanowią inaczej,
                  Operator nie dokonuje proporcjonalnych zwrotów za niewykorzystane
                  dni okresu rozliczeniowego.
                </p>
              </Section>

              <Section number={24} title="Zawieszenie konta przy braku płatności lub naruszeniu regulaminu">
                <p>
                  Operator może zawiesić lub ograniczyć dostęp do płatnych funkcji
                  w przypadku braku płatności, błędu płatności, cofnięcia płatności
                  albo naruszenia Regulaminu. Ograniczenie może dotyczyć między
                  innymi publikowania ofert, widoczności profilu lub dostępu do
                  wybranych funkcji panelu.
                </p>
              </Section>

              <Section number={25} title="Odpowiedzialność użytkowników">
                <p>
                  Użytkownicy odpowiadają za treści ofert, dane profili, treść RFQ,
                  załączniki, legalność dokumentacji technicznej oraz działania
                  podejmowane poza Serwisem. Umowy produkcyjne, usługowe,
                  logistyczne lub handlowe są zawierane bezpośrednio między
                  użytkownikami poza portalem.
                </p>
              </Section>

              <Section number={26} title="Wyłączenia odpowiedzialności Operatora">
                <p>
                  Operator nie gwarantuje zawarcia umowy, jakości usług,
                  wypłacalności firm, terminowości, dostępności mocy, kompletności
                  ofert ani realizacji zleceń. Operator nie jest stroną relacji
                  handlowej między użytkownikami i nie odpowiada za ich wzajemne
                  rozliczenia, z zastrzeżeniem przepisów bezwzględnie
                  obowiązujących.
                </p>
              </Section>

              <Section number={27} title="Dostępność techniczna i przerwy serwisowe">
                <p>
                  Operator dokłada starań, aby Serwis działał stabilnie, ale nie
                  gwarantuje nieprzerwanej dostępności. Możliwe są przerwy
                  techniczne, prace serwisowe, awarie infrastruktury dostawców lub
                  ograniczenia wynikające z bezpieczeństwa.
                </p>
              </Section>

              <Section number={28} title="Reklamacje">
                <p>
                  Reklamacje dotyczące działania Serwisu można kierować na adres
                  [Wpisz_Email_Reklamacje]. Reklamacja powinna zawierać opis
                  problemu, dane zgłaszającego, identyfikację konta lub treści oraz
                  oczekiwany sposób rozpatrzenia.
                </p>
              </Section>

              <Section number={29} title="Zmiany regulaminu">
                <p>
                  Operator może zmienić Regulamin w szczególności w razie rozwoju
                  Serwisu, wdrożenia płatności, zmian prawnych, zmian technicznych
                  lub potrzeby doprecyzowania zasad bezpieczeństwa i moderacji.
                </p>
              </Section>

              <Section number={30} title="Prawo właściwe i sąd właściwy">
                <p>
                  Regulamin podlega prawu polskiemu. Spory będą rozstrzygane przez
                  sąd właściwy zgodnie z bezwzględnie obowiązującymi przepisami
                  prawa oraz właściwością stron.
                </p>
              </Section>

              <Section number={31} title="Postanowienia końcowe">
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
