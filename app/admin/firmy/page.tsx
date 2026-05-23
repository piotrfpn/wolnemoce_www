import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Zarządzanie firmami",
  description: "Lista wszystkich firm w panelu admina WolneMoce.pl.",
};

export default async function AdminCompaniesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/panel");
  }

  const { data: companies, error } = await supabase
    .from("companies")
    .select(
      "id, name, nip, regon, krs, business_status, primary_pkd, location_city, location_voivodeship, is_verified, created_at"
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1a5f3c]"
              >
                <i className="fas fa-arrow-left"></i>
                Wróć do panelu
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900">Firmy</h1>
              <p className="mt-2 text-sm text-slate-600">
                Lista firm zarejestrowanych w systemie.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Nie udało się załadować listy firm: {error.message}
              </div>
            ) : !companies || companies.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Brak firm w bazie.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-3 font-bold">Firma</th>
                      <th className="pb-3 font-bold">NIP / REGON / KRS</th>
                      <th className="pb-3 font-bold">Lokalizacja</th>
                      <th className="pb-3 font-bold">Status Gus</th>
                      <th className="pb-3 font-bold">Weryfikacja</th>
                      <th className="pb-3 font-bold text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companies.map((company) => (
                      <tr key={company.id} className="group">
                        <td className="py-4">
                          <div className="font-bold text-slate-900">
                            {company.name}
                          </div>
                        </td>
                        <td className="py-4 text-slate-600">
                          <div>NIP: {company.nip || "-"}</div>
                          <div className="text-xs">REGON: {company.regon || "-"}</div>
                          <div className="text-xs">KRS: {company.krs || "-"}</div>
                        </td>
                        <td className="py-4 text-slate-600">
                          {company.location_city} ({company.location_voivodeship})
                        </td>
                        <td className="py-4">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {company.business_status || "Brak danych"}
                          </span>
                        </td>
                        <td className="py-4">
                          {company.is_verified ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1a5f3c]/10 px-2.5 py-1 text-xs font-bold text-[#1a5f3c]">
                              <i className="fas fa-check-circle"></i> Zweryfikowana
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                              <i className="fas fa-clock"></i> Niezweryfikowana
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <Link
                            href={`/admin/firmy/${company.id}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                          >
                            <i className="fas fa-eye"></i> Szczegóły
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
