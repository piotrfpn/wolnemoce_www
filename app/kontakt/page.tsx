import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import StaticFormField from "@/components/StaticFormField";
import { contactInfo, faqs } from "@/lib/mockData";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Statyczna podstrona kontaktowa WolneMoce.pl z formularzem UI-only i FAQ.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Kontakt"
          title="Porozmawiajmy o wolnych mocach produkcyjnych"
          description="Napisz, jeśli szukasz wykonawcy albo chcesz pokazać dostępne moce swojej firmy. Formularz w MVP jest wyłącznie elementem UI."
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

          <form className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Formularz kontaktowy
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Formularz nie wysyła danych. To statyczny widok docelowego
                kontaktu.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <StaticFormField label="Imię i nazwisko" name="name" icon="fas fa-user" />
              <StaticFormField label="Firma" name="company" icon="fas fa-building" />
              <StaticFormField label="Email" name="email" type="email" icon="fas fa-envelope" />
              <StaticFormField label="Telefon" name="phone" type="tel" icon="fas fa-phone" />
              <div className="md:col-span-2">
                <StaticFormField
                  label="Wiadomość"
                  name="message"
                  textarea
                  placeholder="Opisz krótko, czego szukasz lub jakie moce chcesz pokazać."
                  icon="fas fa-message"
                />
              </div>
            </div>

            <button type="button" className="mt-6 btn btn-primary">
              Wyślij wiadomość
            </button>
          </form>
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
