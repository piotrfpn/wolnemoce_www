import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createClient } from "@/lib/supabase/server";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.addOfferPage.seoTitle,
  description: dictionary.addOfferPage.seoDescription,
};

export default async function AddOfferPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/panel/oferty/nowa");
  }

  redirect(`/logowanie?next=${encodeURIComponent("/panel/oferty/nowa")}`);
}
