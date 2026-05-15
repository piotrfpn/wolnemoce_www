import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Pricing from "@/components/Pricing";

export const metadata = {
  title: "Cennik | WolneMoce.pl",
  description:
    "Statyczny cennik WolneMoce.pl: FREE, PRO, ENTERPRISE oraz dodatki promocyjne.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Cennik MVP"
          title="Proste plany dla firm produkcyjnych"
          description="Cennik jest statyczną prezentacją modelu. Przyciski prowadzą do formularza dodania oferty lub kontaktu, bez płatności i bez integracji Stripe."
          icon="fas fa-tags"
        />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
