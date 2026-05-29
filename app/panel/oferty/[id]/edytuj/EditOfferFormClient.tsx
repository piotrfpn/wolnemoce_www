"use client";

import OfferFormClient from "../../OfferFormClient";
import type {
  PanelCommonDictionary,
  PanelOfferFormDictionary,
} from "@/lib/i18n/types";

type CompanyData = {
  id: string;
  name: string | null;
  industry: string | null;
  industries: string[] | null;
  service_types: string[] | null;
};

type OfferStatus = "draft" | "pending" | "active" | "rejected" | "archived";

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

type OfferImageData = {
  id: string;
  path: string;
  alt: string | null;
  sort_order: number | null;
};

export default function EditOfferFormClient({
  company,
  offer,
  offerImages,
  dict,
  dictCommon,
}: {
  company: CompanyData;
  offer: OfferData;
  offerImages: OfferImageData[];
  dict: PanelOfferFormDictionary;
  dictCommon: PanelCommonDictionary;
}) {
  return (
    <OfferFormClient
      mode="edit"
      company={company}
      offer={offer}
      offerImages={offerImages}
      dict={dict}
      dictCommon={dictCommon}
    />
  );
}
