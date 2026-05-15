import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import StaticFormField from "@/components/StaticFormField";
import { categories, provinces, services } from "@/lib/mockData";

export const metadata = {
  title: "Dodaj ofertę | WolneMoce.pl",
  description:
    "Statyczny formularz dodania oferty wolnych mocy produkcyjnych w WolneMoce.pl.",
};

const categoryOptions = categories.map((category) => ({
  label: category,
  value: category,
}));

const provinceOptions = provinces.map((province) => ({
  label: province,
  value: province,
}));

const serviceOptions = services.map((service) => ({
  label: service,
  value: service,
}));

export default function AddOfferPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Dodaj ofertę"
          title="Pokaż wolne moce swojej firmy"
          description="Wypełnij statyczny formularz MVP. Dane nie są wysyłane, a przycisk służy wyłącznie do prezentacji docelowego procesu weryfikacji."
          icon="fas fa-plus"
        />

        <section className="section">
          <form className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Dane firmy i możliwości
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Formularz jest UI-only i nie wykonuje żadnej akcji po kliknięciu.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <StaticFormField label="Nazwa firmy" name="company" icon="fas fa-building" />
              <StaticFormField label="NIP" name="nip" icon="fas fa-id-card" />
              <StaticFormField label="Branża" name="category" options={categoryOptions} icon="fas fa-industry" />
              <StaticFormField label="Województwo" name="province" options={provinceOptions} icon="fas fa-map" />
              <StaticFormField label="Miasto" name="city" icon="fas fa-location-dot" />
              <StaticFormField label="Rodzaj usługi" name="service" options={serviceOptions} icon="fas fa-cogs" />
              <StaticFormField label="Tytuł oferty" name="title" icon="fas fa-heading" />
              <StaticFormField label="Dostępna moc" name="capacity" icon="fas fa-chart-bar" />
              <StaticFormField label="Jednostka mocy" name="capacityUnit" placeholder="Np. szt/mies., tony/mies." icon="fas fa-ruler" />
              <StaticFormField label="Minimalne zamówienie" name="minimumOrder" icon="fas fa-boxes-stacked" />
              <StaticFormField label="Termin realizacji" name="leadTime" icon="fas fa-clock" />
              <StaticFormField label="Certyfikaty" name="certificates" placeholder="Np. ISO 9001, CE, GMP" icon="fas fa-certificate" />
              <div className="md:col-span-2">
                <StaticFormField
                  label="Opis możliwości produkcyjnych"
                  name="description"
                  textarea
                  rows={5}
                  placeholder="Opisz park maszynowy, technologie, materiały, typowe serie i dostępność."
                  icon="fas fa-align-left"
                />
              </div>
            </div>

            <div className="mt-10 border-t border-slate-200 pt-8">
              <h2 className="mb-5 text-2xl font-extrabold text-slate-900">
                Osoba kontaktowa
              </h2>
              <div className="grid gap-5 md:grid-cols-3">
                <StaticFormField label="Osoba kontaktowa" name="contactPerson" icon="fas fa-user-tie" />
                <StaticFormField label="Email" name="email" type="email" icon="fas fa-envelope" />
                <StaticFormField label="Telefon" name="phone" type="tel" icon="fas fa-phone" />
              </div>
            </div>

            <button type="button" className="mt-8 btn btn-primary">
              Wyślij do weryfikacji
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
