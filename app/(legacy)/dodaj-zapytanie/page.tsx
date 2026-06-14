import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dodaj zapytanie produkcyjne | WolneMoce",
  description: "Dodaj zlecenie produkcyjne i znajdź wykonawcę lub podwykonawcę.",
};

const targetPath = "/panel/moje-zapytania/nowe";

export default async function AddCapacityRequestRedirectPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const encoded = encodeURIComponent(targetPath);
    redirect(`/logowanie?next=${encoded}&return_to=${encoded}`);
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect(`/panel/profil?return_to=${encodeURIComponent(targetPath)}`);
  }

  redirect(targetPath);
}
