"use client";

import OfferFormClient from "../../OfferFormClient";

type CompanyData = {
  id: string;
  name: string | null;
  industry: string | null;
  industries: string[] | null;
  service_types: string[] | null;
};

type OfferStatus = "draft" | "pending" | "active" | "rejected";

type OfferData = {
  id: string;
  title: string | null;
  branch?: string | null;
  service_type: string | null;
  description: string | null;
  power_available: string | null;
  min_order: string | null;
  lead_time: string | null;
  status: OfferStatus;
};

export default function EditOfferFormClient({
  company,
  offer,
}: {
  company: CompanyData;
  offer: OfferData;
}) {
  return <OfferFormClient mode="edit" company={company} offer={offer} />;
}
