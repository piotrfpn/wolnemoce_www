"use client";

import OfferFormClient from "../OfferFormClient";

type CompanyData = {
  id: string;
  name: string | null;
  industry: string | null;
  industries: string[] | null;
  service_types: string[] | null;
};

export default function NewOfferFormClient({
  company,
}: {
  company: CompanyData;
}) {
  return <OfferFormClient mode="new" company={company} />;
}
