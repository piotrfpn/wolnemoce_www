"use client";

import OfferFormClient from "../OfferFormClient";
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

export default function NewOfferFormClient({
  company,
  dict,
  dictCommon,
}: {
  company: CompanyData;
  dict: PanelOfferFormDictionary;
  dictCommon: PanelCommonDictionary;
}) {
  return (
    <OfferFormClient
      mode="new"
      company={company}
      dict={dict}
      dictCommon={dictCommon}
    />
  );
}
