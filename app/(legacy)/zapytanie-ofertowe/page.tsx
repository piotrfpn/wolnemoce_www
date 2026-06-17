import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { getInitialRfqBuyerData } from "@/lib/rfqBuyerData";
import RfqRequestView, { type RfqOffer } from "@/components/views/RfqRequestView";

export const metadata: Metadata = {
  title: "Zapytanie ofertowe",
  description:
    "Wyślij zapytanie ofertowe RFQ do aktywnej oferty w portalu WolneMoce.",
};

type RfqRequestPageProps = {
  searchParams?: {
    oferta?: string;
  };
};

async function getActiveOffer(slug?: string) {
  if (!slug) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, title, slug, branch, service_type, power_available, lead_time, status, companies!inner(id, name, slug, location_voivodeship, location_city, is_verified)"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as RfqOffer;
}

export default async function RfqRequestPage({
  searchParams,
}: RfqRequestPageProps) {
  const [selectedOffer, initialBuyerData] = await Promise.all([
    getActiveOffer(searchParams?.oferta),
    getInitialRfqBuyerData(),
  ]);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <RfqRequestView
          offer={selectedOffer}
          requestedSlug={searchParams?.oferta ?? ""}
          initialBuyerData={initialBuyerData}
        />
      </main>
      <Footer />
    </>
  );
}
