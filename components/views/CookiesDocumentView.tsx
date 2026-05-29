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
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
              {t.betaNotice}
            </div>

            <div className="space-y-10">
              <Section number={1} title="Czym są cookies">
                <p>
                  Cookies to niewielkie pliki tekstowe zapisywane na urządzeniu
                  użytkownika przez przeglądarkę. Mogą służyć do utrzymania sesji,
                  zapamiętania ustawień, bezpieczeństwa, obsługi płatności lub
                  analityki. Podobne funkcje mogą pełnić także inne technologie
                  lokalnego przechowywania danych.
                </p>
              </Section>

              <Section number={2} title="Jakich kategorii cookies używa portal">
                <ul className="list-disc space-y-2 pl-5">
                  <li><strong>Niezbędne i techniczne</strong> - wymagane do działania Serwisu.</li>
                  <li><strong>Bezpieczeństwa</strong> - pomagają chronić konto i panel.</li>
                  <li><strong>Sesyjne i logowania</strong> - utrzymują sesję użytkownika.</li>
                  <li><strong>Płatnicze Stripe</strong> - mogą być używane, jeżeli płatności zostaną wdrożone.</li>
                  <li><strong>Analityczne opcjonalne</strong> - mogą zostać wdrożone po uzyskaniu wymaganej zgody.</li>
                </ul>
              </Section>

              <Section number={3} title="Cookies Supabase/Auth">
                <p>
                  Serwis może wykorzystywać mechanizmy sesyjne Supabase Auth do
                  utrzymania logowania użytkownika, zabezpieczenia dostępu do
                  panelu oraz autoryzacji działań w aplikacji. Bez tych mechanizmów
                  logowanie i ochrona konta nie działałyby prawidłowo.
                </p>
              </Section>

              <Section number={4} title="Cookies Stripe">
                <p>
                  Jeżeli płatności zostaną wdrożone, Stripe może wykorzystywać
                  cookies lub podobne technologie do obsługi płatności,
                  bezpieczeństwa, przeciwdziałania nadużyciom, anti-fraud oraz
                  obsługi 3D Secure.
                </p>
              </Section>

              <Section number={5} title="Cookies Vercel/Supabase techniczne">
                <p>
                  Dostawcy infrastruktury, tacy jak Vercel i Supabase, mogą
                  wykorzystywać techniczne cookies lub podobne identyfikatory
                  konieczne do działania aplikacji, bezpieczeństwa, routingu,
                  obsługi sesji i stabilności usług.
                </p>
              </Section>

              <Section number={6} title="Analityka">
                <p>
                  Portal może wykorzystywać narzędzia analityczne po uzyskaniu
                  wymaganej zgody, jeżeli zostaną wdrożone. Na etapie MVP narzędzia
                  takie jak Google Analytics lub podobne rozwiązania nie muszą być
                  aktywne. Cookies analityczne, jeżeli zostaną uruchomione, będą
                  traktowane jako opcjonalne.
                </p>
              </Section>

              <Section number={7} title="Zgoda i zarządzanie cookies">
                <p>
                  Cookies niezbędne są wymagane do działania portalu i mogą być
                  stosowane bez odrębnej zgody. Cookies opcjonalne powinny być
                  uruchamiane po uzyskaniu zgody, jeżeli zostaną wdrożone.
                  Użytkownik może zarządzać cookies w ustawieniach swojej
                  przeglądarki.
                </p>
              </Section>

              <Section number={8} title="Skutki wyłączenia cookies">
                <p>
                  Wyłączenie cookies niezbędnych może spowodować, że logowanie,
                  panel użytkownika, ochrona sesji, autoryzacja lub płatności nie
                  będą działały prawidłowo. Wyłączenie cookies opcjonalnych nie
                  powinno blokować podstawowego korzystania z Serwisu.
                </p>
              </Section>

              <Section number={9} title="Zmiany polityki cookies">
                <p>
                  Polityka Cookies może być aktualizowana w związku z rozwojem
                  Serwisu, wdrożeniem płatności, zmianami dostawców, dodaniem
                  narzędzi analitycznych albo zmianami prawa.
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
