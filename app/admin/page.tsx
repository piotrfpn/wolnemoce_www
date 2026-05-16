import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/LogoutButton";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Panel administratora",
  description: "Panel administratora WolneMoce.pl.",
};

const adminSections = [
  { title: "Oferty do zatwierdzenia", icon: "fas fa-clipboard-check" },
  { title: "Firmy", icon: "fas fa-building" },
  { title: "Zapytania RFQ", icon: "fas fa-inbox" },
  { title: "Użytkownicy", icon: "fas fa-users" },
  { title: "Płatności", icon: "fas fa-credit-card" },
];

export default async function AdminPage() {
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

  if (profile?.role !== "admin") {
    redirect("/panel");
  }

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Panel administratora
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900">
                  Panel administratora
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Zalogowano jako admin: {user.email}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>

          <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {adminSections.map((section) => (
              <div
                key={section.title}
                className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                  <i className={section.icon}></i>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Moduł administracyjny — wkrótce.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
