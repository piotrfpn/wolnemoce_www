import type { Metadata } from "next";
import RfqSuccessView from "@/components/views/RfqSuccessView";

export const metadata: Metadata = {
  title: "Zapytanie wysłane",
  description: "Ekran sukcesu formularza zapytania ofertowego WolneMoce.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RfqSentPage() {
  return <RfqSuccessView locale="pl" />;
}
