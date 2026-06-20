// app/(legacy)/zapytanie-wyslane/page.tsx
import type { Metadata } from "next";
import RfqSuccessView from "@/components/views/RfqSuccessView";
import { getDictionary } from "@/lib/i18n/getDictionary";

export function generateMetadata(): Metadata {
  const dictionary = getDictionary("pl");

  return {
    title: dictionary.rfqSuccess.metadataTitle,
    description: dictionary.rfqSuccess.metadataDescription,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function RfqSentPage() {
  const dictionary = getDictionary("pl");

  return (
    <RfqSuccessView
      locale="pl"
      t={dictionary.rfqSuccess}
    />
  );
}
