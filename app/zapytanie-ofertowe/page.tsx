import { Suspense } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RfqRequestClient from "./RfqRequestClient";

export const metadata = {
  title: "Zapytanie ofertowe | WolneMoce.pl",
  description:
    "Statyczny formularz zapytania ofertowego RFQ w portalu WolneMoce.pl.",
};

export default function RfqRequestPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white">
        <Suspense
          fallback={
            <section className="px-6 pb-20 pt-36">
              <div className="mx-auto max-w-[1400px] rounded-[24px] border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
                Ładowanie formularza...
              </div>
            </section>
          }
        >
          <RfqRequestClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
