import type { Metadata } from "next";
import AddCapacityRequestRedirectView from "@/components/views/AddCapacityRequestRedirectView";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const dynamic = "force-dynamic";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.panel.capacityRequestForm.metadata.title,
  description: dictionary.panel.capacityRequestForm.metadata.description,
};

export default function AddCapacityRequestRedirectPage() {
  return <AddCapacityRequestRedirectView loginPath="/logowanie" />;
}
