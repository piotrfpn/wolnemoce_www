import "server-only";
import { getInitialRfqBuyerData } from "@/lib/rfqBuyerData";
import { createClient } from "@/lib/supabase/server";
import RfqRequestView, { type RfqOffer } from "@/components/views/RfqRequestView";
import type { Locale } from "@/lib/i18n/config";

import { getDictionary } from "@/lib/i18n/getDictionary";

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

export default async function RfqRequestPageView({
  locale,
  oferta,
}: {
  locale: Locale;
  oferta?: string | string[];
}) {
  const requestedSlug = Array.isArray(oferta)
    ? oferta[0] ?? ""
    : oferta ?? "";

  const [selectedOffer, initialBuyerData] = await Promise.all([
    getActiveOffer(requestedSlug),
    getInitialRfqBuyerData(),
  ]);

  const dictionary = getDictionary(locale);

  return (
    <RfqRequestView
      locale={locale}
      offer={selectedOffer}
      requestedSlug={requestedSlug}
      initialBuyerData={initialBuyerData}
      copy={dictionary.rfqRequest}
    />
  );
}
