import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import PanelNavbar from "@/components/PanelNavbar";
import { createClient } from "@/lib/supabase/server";
import ContactMessageActionsClient from "./ContactMessageActionsClient";

export const metadata: Metadata = {
  title: "Wiadomości kontaktowe | Panel administratora",
  description: "Administracyjna skrzynka wiadomości kontaktowych WolneMoce.",
};

type ContactMessage = {
  id: string;
  name: string | null;
  email: string | null;
  company_name: string | null;
  phone: string | null;
  topic: string | null;
  message: string | null;
  source: string | null;
  status: string | null;
  created_at: string | null;
  read_at: string | null;
  handled_at: string | null;
};

type AdminContactMessagesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const statusLabels: Record<string, string> = {
  new: "Nowe",
  read: "Przeczytana",
  handled: "Obsłużona",
  archived: "Zarchiwizowana",
};

const statusClasses: Record<string, string> = {
  new: "bg-red-50 text-red-700",
  read: "bg-amber-50 text-amber-700",
  handled: "bg-emerald-50 text-emerald-700",
  archived: "bg-slate-100 text-slate-500",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getSingleParam(
  searchParams: AdminContactMessagesPageProps["searchParams"],
  key: string
) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function buildMessagesHref(params: { status?: string; sort?: string }) {
  const query = new URLSearchParams();

  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }

  if (params.sort && params.sort !== "newest") {
    query.set("sort", params.sort);
  }

  const queryString = query.toString();
  return queryString
    ? `/admin/contact-messages?${queryString}`
    : "/admin/contact-messages";
}

const statusFilters = [
  { label: "Wszystkie", value: "all" },
  { label: "Nowe", value: "new" },
  { label: "Przeczytane", value: "read" },
  { label: "Obsłużone", value: "handled" },
  { label: "Zarchiwizowane", value: "archived" },
  { label: "Tylko nieobsłużone", value: "unhandled" },
];

const sortOptions = [
  { label: "Najnowsze", value: "newest" },
  { label: "Najstarsze", value: "oldest" },
];

async function requireAdmin() {
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

  return supabase;
}

export default async function AdminContactMessagesPage({
  searchParams,
}: AdminContactMessagesPageProps) {
  const supabase = await requireAdmin();
  const requestedStatus = getSingleParam(searchParams, "status");
  const requestedSort = getSingleParam(searchParams, "sort");
  const activeStatus = statusFilters.some((filter) => filter.value === requestedStatus)
    ? requestedStatus
    : "all";
  const activeSort = requestedSort === "oldest" ? "oldest" : "newest";
  const ascending = activeSort === "oldest";
  let messagesQuery = supabase
    .from("contact_messages")
    .select(
      "id, name, email, company_name, phone, topic, message, source, status, created_at, read_at, handled_at"
    );

  if (activeStatus === "unhandled") {
    messagesQuery = messagesQuery.in("status", ["new", "read"]);
  } else if (activeStatus !== "all") {
    messagesQuery = messagesQuery.eq("status", activeStatus);
  }

  const { data, error } = await messagesQuery
    .order("created_at", { ascending })
    .limit(100);

  const messages = (data ?? []) as ContactMessage[];

  return (
    <>
      <PanelNavbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1400px] px-6 py-16">
          <div className="mb-8 flex min-w-0 flex-col gap-5 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between md:p-8">
            <div className="min-w-0">
              <Link
                href="/admin"
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline"
              >
                <i className="fas fa-arrow-left text-xs"></i>
                Wróć do admina
              </Link>
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
                Panel administratora
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900">
                Wiadomości kontaktowe
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Wiadomości zapisane z formularza kontaktowego. Widok jest
                dostępny wyłącznie dla administratora.
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Filtr statusu
                </p>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((filter) => (
                    <Link
                      key={filter.value}
                      href={buildMessagesHref({
                        status: filter.value,
                        sort: activeSort,
                      })}
                      className={`rounded-full px-3 py-2 text-xs font-bold no-underline transition ${
                        activeStatus === filter.value
                          ? "bg-[#1a5f3c] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-[#1a5f3c]/10 hover:text-[#1a5f3c]"
                      }`}
                    >
                      {filter.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Sortowanie
                </p>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <Link
                      key={option.value}
                      href={buildMessagesHref({
                        status: activeStatus,
                        sort: option.value,
                      })}
                      className={`rounded-full px-3 py-2 text-xs font-bold no-underline transition ${
                        activeSort === option.value
                          ? "bg-[#1a5f3c] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-[#1a5f3c]/10 hover:text-[#1a5f3c]"
                      }`}
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Nie udało się pobrać wiadomości kontaktowych: {error.message}
            </div>
          ) : null}

          {messages.length > 0 ? (
            <div className="space-y-5">
              {messages.map((message) => {
                const status = message.status ?? "new";

                return (
                  <article
                    key={message.id}
                    className={`min-w-0 rounded-[24px] border p-5 shadow-sm md:p-6 ${
                      status === "new"
                        ? "border-red-100 bg-red-50/30"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              statusClasses[status] ?? statusClasses.new
                            }`}
                          >
                            {statusLabels[status] ?? status}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {formatDate(message.created_at)}
                          </span>
                          {message.source ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              {message.source}
                            </span>
                          ) : null}
                        </div>
                        <h2 className="break-words text-xl font-extrabold text-slate-900">
                          {message.topic || "Wiadomość kontaktowa"}
                        </h2>
                        <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                          {message.name || "Brak imienia"}
                          {message.company_name ? ` · ${message.company_name}` : ""}
                        </p>
                      </div>
                      <ContactMessageActionsClient
                        messageId={message.id}
                        status={message.status}
                        email={message.email}
                        topic={message.topic}
                      />
                    </div>

                    <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2">
                      {[
                        ["Imię i nazwisko", message.name],
                        ["Firma", message.company_name],
                        ["Email", message.email],
                        ["Telefon", message.phone],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                            {label}
                          </p>
                          <p className="break-words text-sm font-bold text-slate-900">
                            {value || "Brak"}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Treść wiadomości
                      </p>
                      <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-700">
                        {message.message || "Brak treści."}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Brak wiadomości kontaktowych dla wybranych filtrów.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
