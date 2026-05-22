import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { contactInfo, faqs } from "@/lib/mockData";
import ContactFormClient from "./ContactFormClient";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Podstrona kontaktowa WolneMoce.pl z formularzem kontaktowym i FAQ.",
};

type ContactPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const partnerTopics = {
  credos: {
    subject: "Wsparcie księgowo-prawne Credos",
    description:
      "Pytanie dotyczy płatnego wsparcia partnerskiego Credos w zakresie księgowości, prawa i formalnej obsługi współpracy B2B. Usługa nie jest automatycznie zawarta w planach WolneMoce.pl i wymaga osobnego ustalenia zakresu oraz ceny.",
    icon: "fas fa-scale-balanced",
  },
  logimarket: {
    subject: "Doradztwo procesowe i łańcuch dostaw LogiMarket",
    description:
      "Pytanie dotyczy płatnego doradztwa partnerskiego LogiMarket w zakresie procesów, outsourcingu produkcji, RFQ, make-or-buy oraz łańcucha dostaw. Usługa nie jest automatycznie zawarta w planach WolneMoce.pl i wymaga osobnego ustalenia zakresu oraz ceny.",
    icon: "fas fa-route",
  },
};

function getSingleParam(
  searchParams: ContactPageProps["searchParams"],
  key: string
) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function ContactPage({ searchParams }: ContactPageProps) {
  const topicParam = getSingleParam(searchParams, "temat").toLowerCase().trim();
  const partnerTopic =
    topicParam === "credos" || topicParam === "logimarket"
      ? partnerTopics[topicParam]
      : null;

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Kontakt"
          title="Porozmawiajmy o wolnych mocach produkcyjnych"
          description="Napisz, jeśli szukasz wykonawcy albo chcesz pokazać dostępne moce swojej firmy."
          icon="fas fa-envelope"
        />

        <section className="section grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            {[
              ["fas fa-envelope", "Email", contactInfo.email],
              ["fas fa-phone", "Telefon", contactInfo.phone],
              ["fas fa-location-dot", "Lokalizacja", contactInfo.city],
              ["fas fa-clock", "Godziny", contactInfo.hours],
            ].map(([icon, label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <i className={`${icon} mb-4 text-2xl text-[#1a5f3c]`}></i>
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  {label}
                </h2>
                <p className="mt-1 text-lg font-extrabold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div>
            {partnerTopic ? (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1a5f3c]">
                    <i className={partnerTopic.icon}></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                      Partner usługowy
                    </p>
                    <h3 className="font-extrabold text-slate-900">
                      {partnerTopic.subject}
                    </h3>
                  </div>
                </div>
                <p>{partnerTopic.description}</p>
              </div>
            ) : null}

            <ContactFormClient
              initialTopic={partnerTopic?.subject ?? ""}
              source={topicParam ? `contact:${topicParam}` : "contact"}
            />
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto grid max-w-[1400px] gap-6 md:grid-cols-2">
            <div className="rounded-[24px] bg-white p-7 shadow-sm">
              <h2 className="mb-3 text-xl font-extrabold text-slate-900">
                Dla firm szukających wykonawcy
              </h2>
              <p className="text-sm leading-7 text-slate-500">
                Pomagamy uporządkować zapytanie i znaleźć firmy z dostępnymi
                mocami w konkretnej branży.
              </p>
            </div>
            <div className="rounded-[24px] bg-white p-7 shadow-sm">
              <h2 className="mb-3 text-xl font-extrabold text-slate-900">
                Dla firm z wolnymi mocami
              </h2>
              <p className="text-sm leading-7 text-slate-500">
                Możesz pokazać dostępność, kompetencje, certyfikaty i typowe
                parametry realizacji.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header fade-in visible">
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Najczęstsze pytania</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-[20px] border border-slate-200 bg-white p-6">
                <h3 className="mb-2 font-extrabold text-slate-900">{faq.question}</h3>
                <p className="text-sm leading-7 text-slate-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
