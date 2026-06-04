import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

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

type LegalPageProps = {
  locale?: Locale;
};

export default function PrivacyDocumentView({ locale = defaultLocale }: LegalPageProps) {
  const dictionary = getDictionary(locale);
  const t = dictionary.legal;

  return (
    <>
      <Navbar locale={locale} />
      <main>
        <PageHero
          label={t.label}
          title={t.privacy.title}
          description={t.privacy.description}
          icon="fas fa-user-shield"
        />

        <section className="section">
          <article className="mx-auto max-w-4xl rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <div className="mb-4 rounded-2xl border border-[#1a5f3c]/20 bg-[#1a5f3c]/5 p-5 text-sm leading-7 text-[#1a5f3c]">
              {t.notice}
            </div>
            {locale !== "pl" && (
              <div className="mb-6 border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
                {locale === "en" && "The legally binding version of the Terms and Conditions, Privacy Policy and Cookie Policy is the Polish language version. Translations into other languages are provided for information purposes only."}
                {locale === "de" && "Die rechtlich verbindliche Fassung der Allgemeinen Geschäftsbedingungen, der Datenschutzerklärung und der Cookie-Richtlinie ist die polnische Sprachfassung. Übersetzungen in andere Sprachen dienen ausschließlich Informationszwecken."}
                {locale === "uk" && "Юридично обов’язковою версією Регламенту, Політики конфіденційності та Політики cookies є версія польською мовою. Переклади іншими мовами надаються виключно з інформаційною метою."}
                {locale === "es" && "La versión legalmente vinculante de los Términos y Condiciones, la Política de Privacidad y la Política de Cookies es la versión en lengua polaca. Las traducciones a otros idiomas se proporcionan únicamente con fines informativos."}
                {locale === "fr" && "La version juridiquement contraignante des Conditions générales, de la Politique de confidentialité et de la Politique relative aux cookies est la version en langue polonaise. Les traductions dans d’autres langues sont fournies uniquement à titre informatif."}
              </div>
            )}

            <div className="space-y-10">
              <Section number={1} title="Administrator danych">
                <p>
                  Administratorem danych osobowych przetwarzanych w Serwisie jest
                  Operator WolneMoce: PFConsulting Piotr Fiszer,
                  ul. Promienista 114, 60-142 Poznań, Polska, NIP: 7792017326.
                </p>
              </Section>

              <Section number={2} title="Kontakt w sprawach RODO">
                <p>
                  W sprawach dotyczących ochrony danych osobowych można
                  kontaktować się pod adresem e-mail: piotr.fiszer@pfconsulting.pl lub telefonem: +48 604 904 150.
                </p>
              </Section>

              <Section number={3} title="Kategorie osób, których dane dotyczą">
                <ul className="list-disc space-y-2 pl-5">
                  <li>właściciele firm,</li>
                  <li>pracownicy i reprezentanci firm,</li>
                  <li>osoby kontaktowe wskazane w zapytaniach RFQ,</li>
                  <li>administratorzy i operatorzy kont firmowych,</li>
                  <li>osoby zgłaszające naruszenia lub kontaktujące się z Operatorem.</li>
                </ul>
              </Section>

              <Section number={4} title="Kategorie danych">
                <p>W zależności od sposobu korzystania z Serwisu przetwarzane mogą być:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>imię i nazwisko, e-mail, telefon i stanowisko,</li>
                  <li>nazwa firmy, NIP, REGON i adres firmy,</li>
                  <li>dane profilu firmy, branże, usługi, opis i strona WWW,</li>
                  <li>treści ofert, treści RFQ i dane kontaktowe w RFQ,</li>
                  <li>załączniki RFQ oraz metadane plików,</li>
                  <li>dane techniczne, logi, adres IP, informacje o urządzeniu i przeglądarce,</li>
                  <li>identyfikatory konta Supabase i dane sesji,</li>
                  <li>dane płatnicze obsługiwane przez Stripe, jeżeli płatności zostaną wdrożone.</li>
                </ul>
                <p>
                  W przypadku korzystania z funkcji pobierania danych firmy na
                  podstawie numeru NIP, Serwis może przetwarzać dane rejestrowe
                  przedsiębiorcy lub firmy dostępne w publicznych rejestrach, w
                  szczególności takie jak nazwa firmy, NIP, REGON, KRS, adres
                  siedziby, forma prawna, status działalności oraz kody PKD.
                  Dane te są wykorzystywane w celu ułatwienia uzupełnienia
                  profilu firmy, weryfikacji danych rejestrowych, moderacji
                  treści oraz zapewnienia bezpieczeństwa i wiarygodności
                  Serwisu.
                </p>
              </Section>

              <Section number={5} title="Cele i podstawy prawne">
                <ul className="list-disc space-y-2 pl-5">
                  <li>świadczenie usług elektronicznych i obsługa konta,</li>
                  <li>obsługa profilu firmy, ofert, branż i rodzajów usług,</li>
                  <li>obsługa zapytań RFQ, załączników i czasowych signed URLs oraz monitorowanie zapytań przez administratora w celu zapewnienia bezpieczeństwa, przeciwdziałania nadużyciom i prawidłowej obsługi portalu,</li>
                  <li>obsługa płatności, faktur, księgowości i obowiązków podatkowych,</li>
                  <li>bezpieczeństwo IT, zapobieganie nadużyciom i ochrona Serwisu,</li>
                  <li>dochodzenie, ustalenie i obrona roszczeń,</li>
                  <li>kontakt, obsługa zgłoszeń i reklamacji,</li>
                  <li>opcjonalna analityka, jeżeli zostanie wdrożona i będzie wymagała zgody.</li>
                </ul>
                <p>
                  Podstawami prawnymi mogą być w szczególności wykonanie umowy,
                  obowiązek prawny, prawnie uzasadniony interes administratora
                  albo zgoda, jeżeli jest wymagana.
                </p>
              </Section>

              <Section number={6} title="Odbiorcy danych">
                <p>Dane mogą być przekazywane podmiotom wspierającym działanie Serwisu, w tym:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Supabase - infrastruktura bazy danych, Auth i Storage,</li>
                  <li>Vercel - hosting i infrastruktura aplikacji,</li>
                  <li>Stripe - płatności i rozliczenia, jeżeli zostaną wdrożone,</li>
                  <li>dostawcy poczty e-mail i narzędzi IT,</li>
                  <li>biuro księgowe, kancelaria prawna i doradcy,</li>
                  <li>organy publiczne, jeżeli wymagają tego przepisy prawa.</li>
                </ul>
              </Section>

              <Section number={7} title="Stripe">
                <p>
                  Jeżeli płatności zostaną wdrożone, Stripe może obsługiwać dane
                  potrzebne do płatności, fakturowania, bezpieczeństwa, anti-fraud
                  i 3D Secure. Operator nie przechowuje pełnych numerów kart ani
                  kodów CVC. Stripe może działać jako niezależny administrator lub
                  procesor zależnie od zakresu usługi i może przekazywać dane poza
                  EOG przy zastosowaniu właściwych mechanizmów prawnych, takich jak
                  standardowe klauzule umowne.
                </p>
              </Section>

              <Section number={8} title="Transfer danych poza EOG">
                <p>
                  Dane mogą być przetwarzane poza Europejskim Obszarem Gospodarczym
                  przez dostawców infrastruktury lub płatności. W takim przypadku
                  stosowane są odpowiednie mechanizmy prawne, w szczególności
                  decyzje stwierdzające odpowiedni stopień ochrony, standardowe
                  klauzule umowne albo inne instrumenty przewidziane w RODO.
                </p>
              </Section>

              <Section number={9} title="Okres przechowywania">
                <ul className="list-disc space-y-2 pl-5">
                  <li>dane konta - przez czas korzystania z Serwisu oraz okres przedawnienia roszczeń,</li>
                  <li>faktury i dokumenty księgowe - zgodnie z przepisami podatkowymi,</li>
                  <li>logi bezpieczeństwa - przez okres niezbędny do zapewnienia bezpieczeństwa,</li>
                  <li>RFQ i załączniki - przez okres potrzebny do świadczenia usługi, moderacji, bezpieczeństwa i roszczeń.</li>
                </ul>
              </Section>

              <Section number={10} title="Prawa osób">
                <p>Osobie, której dane dotyczą, przysługuje prawo:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>dostępu do danych,</li>
                  <li>sprostowania danych,</li>
                  <li>usunięcia danych,</li>
                  <li>ograniczenia przetwarzania,</li>
                  <li>przenoszenia danych,</li>
                  <li>wniesienia sprzeciwu,</li>
                  <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</li>
                </ul>
              </Section>

              <Section number={11} title="Dobrowolność podania danych">
                <p>
                  Podanie danych jest dobrowolne, ale niezbędne do utworzenia
                  konta, obsługi profilu firmy, dodawania ofert, wysyłania RFQ,
                  obsługi płatności lub kontaktu. Niepodanie wymaganych danych
                  może uniemożliwić korzystanie z wybranych funkcji Serwisu.
                </p>
              </Section>

              <Section number={12} title="Zautomatyzowane decyzje i profilowanie">
                <p>
                  Operator nie stosuje zautomatyzowanego podejmowania decyzji, w
                  tym profilowania, które wywoływałoby wobec osoby skutki prawne
                  lub w podobny sposób istotnie na nią wpływało w rozumieniu RODO.
                </p>
              </Section>

              <Section number={13} title="Bezpieczeństwo danych">
                <p>
                  Operator stosuje środki organizacyjne i techniczne adekwatne do
                  ryzyka, w tym uwierzytelnianie, kontrolę dostępu, RLS, prywatne
                  buckety Storage oraz ograniczone czasowo signed URLs dla plików.
                  Użytkownik powinien chronić dostęp do konta i nie udostępniać
                  linków do plików osobom nieuprawnionym.
                </p>
              </Section>

              <Section number={14} title="Dane w załącznikach RFQ">
                <p>
                  Użytkownik nie powinien przesyłać danych nadmiarowych ani
                  dokumentów, których nie ma prawa udostępnić. Użytkownik odpowiada
                  za legalność i uprawnienie do przekazania dokumentacji
                  technicznej, rysunków, specyfikacji, zdjęć oraz innych plików w
                  ramach RFQ.
                </p>
              </Section>

              <Section number={15} title={t.privacy.companyProjects.title}>
                <p>{t.privacy.companyProjects.intro}</p>
                <ul className="list-disc space-y-2 pl-5">
                  {t.privacy.companyProjects.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Section>

              <Section number={16} title="Kontakt w sprawie usług partnerskich">
                <p>
                  Dane podane w formularzu kontaktowym mogą być wykorzystywane do
                  obsługi zapytania użytkownika. Jeżeli zapytanie dotyczy usługi
                  partnerskiej, dane mogą zostać przekazane właściwemu partnerowi,
                  na przykład Credos albo LogiMarket, w celu przygotowania
                  odpowiedzi lub ustalenia zakresu współpracy.
                </p>
                <p>
                  Zakres przekazania danych powinien być ograniczony do informacji
                  niezbędnych do obsługi konkretnego zapytania.
                </p>
              </Section>

              <Section number={17} title="Zmiany polityki prywatności">
                <p>
                  Polityka prywatności może być aktualizowana w związku z rozwojem
                  Serwisu, zmianą dostawców, wdrożeniem płatności, zmianami prawa
                  lub doprecyzowaniem procesów przetwarzania danych.
                </p>
              </Section>
            </div>
          </article>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
