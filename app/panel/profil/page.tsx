import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import CompanyProfileFormClient from "./CompanyProfileFormClient";

export const metadata: Metadata = {
  title: "Profil firmy",
  description: "Uzupełnij profil firmy w panelu WolneMoce.pl.",
};

export default async function CompanyProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: company } = await supabase
    .from("companies")
    .select(
      "id, nip, name, description, industry, service_types, location_voivodeship, location_city, is_verified"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
              Panel firmy
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Profil firmy
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              Uzupełnij dane firmy, które będą wykorzystywane przy ofertach i
              zapytaniach.
            </p>
          </div>

          <CompanyProfileFormClient
            userId={user.id}
            userEmail={user.email ?? null}
            profile={profile}
            company={company}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
