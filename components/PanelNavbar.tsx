import Navbar from "./Navbar";
import PanelNavLinks from "./PanelNavLinks";
import { getPanelLocale } from "@/lib/i18n/panelLocale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createClient } from "@/lib/supabase/server";

export default async function PanelNavbar() {
  const locale = getPanelLocale();
  const dictionary = getDictionary(locale);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unreadCount = 0;
  let activeCapacityRequestInterestsCount = 0;
  if (user) {
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (company) {
      const { count } = await supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("company_id", company.id)
        .neq("status", "archived")
        .is("recipient_read_at", null);
      unreadCount = count ?? 0;

      const { data: interestCount, error: interestCountError } =
        await supabase.rpc("count_my_active_capacity_request_interests");

      if (interestCountError) {
        console.warn("Failed to count active capacity request interests for panel nav.", {
          code: interestCountError.code,
        });
      }

      activeCapacityRequestInterestsCount = Number(interestCount ?? 0);
    }
  }

  const navLabels = {
    panel: dictionary.panel.nav.dashboard,
    profile: dictionary.panel.nav.profile,
    offers: dictionary.panel.nav.offers,
    projects: dictionary.panel.nav.projects,
    inquiries: dictionary.panel.nav.receivedInquiries,
    sentInquiries: dictionary.panel.nav.sentInquiries,
    myRequests: dictionary.panel.nav.myRequests,
    settings: dictionary.panel.nav.settings,
  };

  return (
    <>
      <Navbar locale={locale} />
      <PanelNavLinks
        locale={locale}
        unreadCount={unreadCount}
        activeCapacityRequestInterestsCount={activeCapacityRequestInterestsCount}
        labels={navLabels}
      />
    </>
  );
}
