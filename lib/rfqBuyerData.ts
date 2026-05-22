import { createClient } from "@/lib/supabase/server";

export type RfqBuyerData = {
  buyer_name: string;
  buyer_company: string;
  buyer_email: string;
  buyer_phone: string;
};

export const emptyRfqBuyerData: RfqBuyerData = {
  buyer_name: "",
  buyer_company: "",
  buyer_email: "",
  buyer_phone: "",
};

export async function getInitialRfqBuyerData(): Promise<RfqBuyerData> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyRfqBuyerData;
  }

  const [{ data: profile }, { data: company }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("companies")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    buyer_name: profile?.full_name ?? "",
    buyer_company: company?.name ?? "",
    buyer_email: user.email ?? "",
    buyer_phone: "",
  };
}
