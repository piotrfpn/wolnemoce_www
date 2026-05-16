import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/LogoutButton";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Panel firmy",
  description: "Panel użytkownika WolneMoce.pl.",
};

const panelItems = [
  {
    title: "Profil firmy",
    description: "Uzupełnij dane firmy",
    icon: "fas fa-building",
    href: "/panel/profil",
    cta: "Przejdź do profilu",
  },
  {
    title: "Moje oferty",
    description: "Dodawaj i edytuj oferty firmy",
    icon: "fas fa-list-check",
    href: "/panel/oferty",
    cta: "Przejdź do ofert",
  },
  {
    title: "Ustawienia konta",
    description: "Dane użytkownika, email i bezpieczeństwo konta.",
    icon: "fas fa-gear",
  },
];

export default async function PanelPage() {
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

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                  Panel użytkownika
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900">
                  Panel firmy
                </h1>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p className="min-w-0 break-words">
                    <strong className="text-slate-900">Email:</strong>{" "}
                    {user.email}
                  </p>
                  <p className="min-w-0">
                    <strong className="text-slate-900">Rola:</strong>{" "}
                    {profile?.role ?? "user"}
                  </p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>

          <div className="grid min-w-0 gap-5 md:grid-cols-3">
            {panelItems.map((item) => {
              const card = (
                <>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a5f3c]/10 text-[#1a5f3c]">
                    <i className={item.icon}></i>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {item.href ? item.title : `${item.title} — wkrótce`}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                  {item.href ? (
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c]">
                      {item.cta}
                      <i className="fas fa-arrow-right text-xs"></i>
                    </span>
                  ) : null}
                </>
              );

              return item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-6 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-[#1a5f3c] hover:shadow-md"
                >
                  {card}
                </Link>
              ) : (
                <div
                  key={item.title}
                  className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {card}
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
