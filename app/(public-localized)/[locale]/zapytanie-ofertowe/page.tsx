import { notFound } from "next/navigation";
import { isSupportedLocale } from "@/lib/i18n/config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RfqRequestPageView from "@/components/views/RfqRequestPageView";

type LocalizedRfqRequestPageProps = {
  params: {
    locale: string;
  };
  searchParams?: {
    oferta?: string | string[];
  };
};

export default function LocalizedRfqRequestPage({
  params,
  searchParams,
}: LocalizedRfqRequestPageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return (
    <>
      <Navbar locale={params.locale} />
      <main className="bg-white">
        <RfqRequestPageView
          locale={params.locale}
          oferta={searchParams?.oferta}
        />
      </main>
      <Footer locale={params.locale} />
    </>
  );
}
