import type { Metadata } from "next";
import AddOfferFormClient from "./AddOfferFormClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Dodaj ofertę",
  description:
    "Statyczny formularz dodania oferty wolnych mocy produkcyjnych w WolneMoce.pl.",
};

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
          <AddOfferFormClient />
        </section>
      </main>
      <Footer />
    </>
  );
}
