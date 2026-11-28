import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { fetchAdminUtmReport } from "@/lib/admin/utmReport";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Źródła rejestracji (UTM) | Panel administratora",
  description: "Raport parametrów UTM dla nowo utworzonych kont i eksport CSV.",
};

export const dynamic = "force-dynamic";

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminUtmPage({
  searchParams,
}: {
  searchParams?: {
    source?: string;
    campaign?: string;
    onlyUtm?: string;
  };
}) {
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

  const source = typeof searchParams?.source === "string" ? searchParams.source : "";
  const campaign =
    typeof searchParams?.campaign === "string" ? searchParams.campaign : "";
  const onlyUtm = searchParams?.onlyUtm === "1";

  const report = await fetchAdminUtmReport({
    source: source || undefined,
    campaign: campaign || undefined,
    onlyUtm,
  });

  const exportParams = new URLSearchParams();
  if (source) exportParams.set("source", source);
  if (campaign) exportParams.set("campaign", campaign);
  if (onlyUtm) exportParams.set("onlyUtm", "1");
  const exportHref = `/api/admin/utm-export${
    exportParams.toString() ? `?${exportParams.toString()}` : ""
  }`;

  return (
    <>
      <PanelNavbar />
      <main className="min-h-screen bg-slate-50 pt-[128px]">
        <section className="mx-auto max-w-[1400px] px-6 py-12">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href="/admin"
                className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline hover:underline"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                Wróć do panelu administratora
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Źródła rejestracji (UTM)
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Parametry <code>utm_source</code>, <code>utm_medium</code>,{" "}
                <code>utm_campaign</code> i <code>utm_content</code> zapisane przy
                tworzeniu konta (e-mail oraz Google).
              </p>
            </div>

            <a
              href={exportHref}
              className="btn btn-primary inline-flex items-center gap-2 no-underline"
            >
              <i className="fas fa-file-csv"></i>
              Eksportuj CSV ({report.rows.length})
            </a>
          </div>

          {report.migrationMissing ? (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              <p className="font-bold">
                Brak kolumn UTM w tabeli <code>profiles</code> w bazie Supabase.
              </p>
              <p className="mt-1.5">
                Uruchom migrację{" "}
                <code>supabase/migrations/00042_profile_utm_attribution.sql</code>{" "}
                w SQL Editorze Supabase, aby rozpocząć zapisywanie UTM przy rejestracji.
              </p>
            </div>
          ) : null}

          {/* Summary KPI cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Wszystkie konta
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {report.totalAccounts}
              </p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Konta z zapisanym UTM
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[#1a5f3c]">
                {report.accountsWithUtm}
              </p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Konta z UTM → dodana firma
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {report.companiesFromUtm}
              </p>
            </div>
          </div>

          {/* Breakdown pills by source & campaign */}
          {report.bySource.length > 0 || report.byCampaign.length > 0 ? (
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">
                  Podział wg utm_source
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.bySource.map((item) => (
                    <Link
                      key={item.label}
                      href={`/admin/pozyskanie?source=${encodeURIComponent(item.label)}&onlyUtm=1`}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-[#1a5f3c] no-underline hover:bg-emerald-100"
                    >
                      <span>{item.label}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-800">
                        {item.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">
                  Podział wg utm_campaign
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.byCampaign.map((item) => (
                    <Link
                      key={item.label}
                      href={`/admin/pozyskanie?campaign=${encodeURIComponent(item.label)}&onlyUtm=1`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 no-underline hover:border-[#1a5f3c] hover:text-[#1a5f3c]"
                    >
                      <span>{item.label}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-800">
                        {item.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Filter Form */}
          <form
            method="GET"
            className="mb-6 flex flex-wrap items-end gap-4 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <label className="block min-w-[180px] flex-1">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                utm_source
              </span>
              <select
                name="source"
                defaultValue={source}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800"
              >
                <option value="">Wszystkie źródła</option>
                {report.sourceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <label className="block min-w-[180px] flex-1">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                utm_campaign
              </span>
              <select
                name="campaign"
                defaultValue={campaign}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800"
              >
                <option value="">Wszystkie kampanie</option>
                {report.campaignOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                name="onlyUtm"
                value="1"
                defaultChecked={onlyUtm}
                className="h-4 w-4 accent-[#1a5f3c]"
              />
              Tylko konta z UTM
            </label>

            <div className="flex items-center gap-2">
              <button type="submit" className="btn btn-primary">
                Filtruj
              </button>
              {source || campaign || onlyUtm ? (
                <Link
                  href="/admin/pozyskanie"
                  className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 no-underline hover:bg-slate-50"
                >
                  Wyczyść
                </Link>
              ) : null}
            </div>
          </form>

          {/* Registrations Table */}
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3.5">Data konta</th>
                    <th className="px-4 py-3.5">Użytkownik</th>
                    <th className="px-4 py-3.5">Firma</th>
                    <th className="px-4 py-3.5">utm_source</th>
                    <th className="px-4 py-3.5">utm_medium</th>
                    <th className="px-4 py-3.5">utm_campaign</th>
                    <th className="px-4 py-3.5">utm_content</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-slate-500"
                      >
                        Brak kont spełniających wybrane filtry.
                      </td>
                    </tr>
                  ) : (
                    report.rows.map((row) => (
                      <tr key={row.userId} className="hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {row.fullName || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {row.email || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {row.companyId ? (
                            <Link
                              href={`/admin/firmy/${row.companyId}`}
                              className="font-semibold text-[#1a5f3c] no-underline hover:underline"
                            >
                              {row.companyName || "Firma"}
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Brak profilu firmy
                            </span>
                          )}
                          {row.companyPlan ? (
                            <div className="text-[11px] font-bold uppercase text-slate-400">
                              {row.companyPlan}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {row.utmSource ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#1a5f3c]">
                              {row.utmSource}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {row.utmMedium || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {row.utmCampaign || (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {row.utmContent || <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
