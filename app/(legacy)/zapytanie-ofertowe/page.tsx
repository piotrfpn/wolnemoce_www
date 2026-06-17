import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RfqRequestPageView from "@/components/views/RfqRequestPageView";

export const metadata: Metadata = {
  title: "Zapytanie ofertowe",
  description:
    "Wyślij zapytanie ofertowe RFQ do aktywnej oferty w portalu WolneMoce.",
};

type RfqRequestPageProps = {
  searchParams?: {
    oferta?: string | string[];
  };
};

export default function RfqRequestPage({
  searchParams,
}: RfqRequestPageProps) {
  return (
    <>
      <Navbar locale="pl" />
      <main className="bg-white">
        <RfqRequestPageView locale="pl" oferta={searchParams?.oferta} />
      </main>
      <Footer locale="pl" />
    </>
  );
}
