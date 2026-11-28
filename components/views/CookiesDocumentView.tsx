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

export default function CookiesDocumentView({ locale = defaultLocale }: LegalPageProps) {
  const dictionary = getDictionary(locale);
  const t = dictionary.legal;

  return (
    <>
      <Navbar locale={locale} />
      <main>
        <PageHero
          label={t.label}
          title={t.cookies.title}
          description={t.cookies.description}
          icon="fas fa-cookie-bite"
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
              <Section number={1} title="Dane Operatora">
                <p>
                  Operatorem i administratorem Serwisu jest: PFConsulting Piotr Fiszer,
                  ul. Promienista 114, 60-142 Poznań, Polska, NIP: 7792017326.
                  Kontakt w sprawach cookies i ochrony prywatności: kontakt@wolnemoce.com, tel: +48 604 904 150.
                </p>
              </Section>

              <Section number={2} title="Czym są cookies i podobne technologie">
                <p>
                  Cookies to niewielkie pliki tekstowe zapisywane na urządzeniu
                  użytkownika przez przeglądarkę. Podobne funkcje mogą pełnić
                  także inne technologie lokalnego przechowywania danych, w tym
                  mechanizmy sesji logowania, preferencji języka lub tymczasowe
                  zapamiętanie danych formularza po stronie przeglądarki.
                </p>
                <p>
                  Zasady przechowywania informacji lub uzyskiwania dostępu do
                  informacji na urządzeniu końcowym użytkownika wynikają w
                  szczególności z Prawa komunikacji elektronicznej, w tym art.
                  399 PKE, oraz z zasad ePrivacy.
                </p>
              </Section>

              <Section number={3} title="Analityka, marketing i Google Consent Mode v2">
                <p>
                  WolneMoce.com wykorzystuje baner zgody na pliki cookies oraz
                  mechanizm <strong>Google Consent Mode v2</strong>. Domyślnie
                  przechowywanie danych analitycznych (<code>analytics_storage</code>)
                  oraz reklamowych (<code>ad_storage</code>, <code>ad_user_data</code>,{" "}
                  <code>ad_personalization</code>) jest ustawione jako wyłączone
                  (<code>denied</code>) do momentu wyrażenia wyraźnej zgody przez
                  użytkownika.
                </p>
                <p>
                  Po wyrażeniu zgody w banerze cookies Serwis może uruchamiać:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong>Google Analytics 4 (GA4)</strong> — pomiar ruchu i
                    zdarzeń konwersyjnych w celu ulepszania działania portalu
                    (wyłącznie po zgodzie na cookies analityczne).
                  </li>
                  <li>
                    <strong>Meta Pixel (Facebook / Instagram)</strong> — pomiar
                    skuteczności kampanii w mediach społecznościowych (wyłącznie
                    po zgodzie na cookies marketingowe).
                  </li>
                </ul>
              </Section>

              <Section number={4} title="Jakich kategorii technologii używa portal">
                <ul className="list-disc space-y-2 pl-5">
                  <li><strong>Niezbędne i techniczne</strong> - wymagane do działania Serwisu oraz zapamiętania wyboru zgody (<code>wm_cookie_consent</code>).</li>
                  <li><strong>Bezpieczeństwa</strong> - pomagają chronić konto i panel.</li>
                  <li><strong>Sesyjne i logowania</strong> - utrzymują sesję użytkownika.</li>
                  <li><strong>Preferencje języka</strong> - obejmują m.in. cookie <code>wm_locale</code>, które zapamiętuje wybrany język lub język panelu.</li>
                  <li><strong>Formularze, panel i atrybucja kampanii</strong> - obejmują technologie potrzebne do obsługi formularzy, przejść między ekranami oraz zachowania parametrów źródła kampanii UTM (<code>wm_utm</code>).</li>
                  <li><strong>Analityczne i marketingowe (opcjonalne)</strong> - uruchamiane wyłącznie po wyrażeniu zgody w banerze cookies (GA4, Meta Pixel).</li>
                </ul>
              </Section>

              <Section number={5} title="Supabase Auth i sesja logowania">
                <p>
                  Serwis może wykorzystywać mechanizmy sesyjne Supabase Auth do
                  utrzymania logowania użytkownika, zabezpieczenia dostępu do
                  panelu oraz autoryzacji działań w aplikacji. Bez tych mechanizmów
                  logowanie i ochrona konta nie działałyby prawidłowo.
                </p>
                <p>
                  Repozytorium potwierdza użycie <code>@supabase/ssr</code> i
                  adaptera cookies dla sesji po stronie serwera i middleware.
                  Dokument nie wskazuje konkretnych nazw tokenów Supabase, ponieważ
                  nie są one jawnie zdefiniowane w kodzie aplikacji. Technologie
                  Supabase Auth służą do utrzymania bezpiecznej sesji zalogowanego
                  użytkownika, w tym tokenu dostępu i tokenu odświeżania
                  przechowywanych zgodnie z konfiguracją aplikacji.
                </p>
              </Section>

              <Section number={6} title="Dostawcy infrastruktury">
                <p>
                  Dostawcy infrastruktury, tacy jak Vercel i Supabase, mogą
                  wykorzystywać techniczne cookies, logi lub podobne identyfikatory
                  konieczne do działania aplikacji, bezpieczeństwa, routingu,
                  obsługi sesji i stabilności usług.
                </p>
              </Section>

              <Section number={7} title="Dane formularzy, kont, ofert i RFQ">
                <p>
                  Dane podawane w formularzach, kontach użytkowników, profilach
                  firm, ofertach i RFQ nie są zbierane przez cookies marketingowe.
                  Są przetwarzane jako dane potrzebne do świadczenia usługi,
                  obsługi konta, publikacji treści, komunikacji B2B,
                  bezpieczeństwa, moderacji i obsługi zapytań.
                </p>
              </Section>

              <Section number={8} title="Zgoda i zarządzanie cookies">
                <p>
                  Cookies niezbędne są wymagane do działania portalu i mogą być
                  stosowane bez odrębnej zgody w zakresie dopuszczalnym przez
                  prawo. Cookies analityczne (GA4) i marketingowe (Meta Pixel) są
                  uruchamiane wyłącznie po wyraźnej zgodzie użytkownika w banerze
                  cookies.
                </p>
                <p>
                  Użytkownik może w każdej chwili zmienić lub wycofać swoją zgodę,
                  klikając przycisk <strong>„Ustawienia cookies”</strong> w stopce
                  strony, a także zarządzać plikami cookies bezpośrednio w
                  ustawieniach swojej przeglądarki.
                </p>
              </Section>

              <Section number={9} title="Skutki wyłączenia cookies">
                <p>
                  Wyłączenie cookies niezbędnych może spowodować, że logowanie,
                  panel użytkownika, ochrona sesji, autoryzacja, formularze lub
                  podstawowe funkcje Serwisu nie będą działały prawidłowo.
                </p>
              </Section>

              <Section number={10} title="Zmiany polityki cookies">
                <p>
                  Polityka Cookies może być aktualizowana w związku z rozwojem
                  Serwisu, zmianami dostawców, wdrożeniem narzędzi wymagających
                  zgody użytkownika albo zmianami prawa.
                </p>
                <p>
                  Signed URLs używane do czasowego dostępu do prywatnych plików
                  nie są cookies i nie są opisywane jako cookies w tej polityce.
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
