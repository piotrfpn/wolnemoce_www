import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import InquiryActionsClient, {
  type InquiryAttachment,
} from "./InquiryActionsClient";

export const metadata: Metadata = {
  title: "Zapytania ofertowe",
  description: "Zapytania ofertowe wysłane do Twojej firmy.",
};

type CompanyInquiry = {
  id: string;
  status: string | null;
  buyer_name: string | null;
  buyer_company: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  quantity_scope: string | null;
  expected_deadline: string | null;
  budget: string | null;
  message: string | null;
  branch: string | null;
  service_type: string | null;
  created_at: string | null;
  offers: {
    title: string | null;
    slug: string | null;
    branch: string | null;
    service_type: string | null;
    status: string | null;
  } | null;
  attachments: InquiryAttachment[];
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

function getStatusLabel(status: string | null) {
  if (status === "read") {
    return "Przeczytane";
  }

  if (status === "archived") {
    return "Archiwum";
  }

  return "Nowe";
}

export default async function PanelInquiriesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) {
    return (
      <>
        <Navbar />
        <main className="bg-slate-50 pt-[72px]">
          <section className="mx-auto max-w-[1200px] px-6 py-16">
            <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h1 className="text-3xl font-extrabold text-slate-900">
                Najpierw uzupełnij profil firmy.
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Zapytania ofertowe są przypisane do profilu firmy.
              </p>
              <Link href="/panel/profil" className="mt-6 btn btn-primary">
                Uzupełnij profil firmy
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, offers(title, slug, branch, service_type, status)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const companyInquiries = (inquiries ?? []) as unknown as CompanyInquiry[];
  const inquiryIds = companyInquiries.map((inquiry) => inquiry.id);
  const { data: attachments } =
    inquiryIds.length > 0
      ? await supabase
          .from("inquiry_attachments")
          .select("id, inquiry_id, original_file_name, mime_type, size_bytes")
          .in("inquiry_id", inquiryIds)
      : { data: [] };
  const attachmentsByInquiryId = new Map<string, InquiryAttachment[]>();

  for (const attachment of (attachments ?? []) as (InquiryAttachment & {
    inquiry_id: string;
  })[]) {
    const current = attachmentsByInquiryId.get(attachment.inquiry_id) ?? [];
    current.push(attachment);
    attachmentsByInquiryId.set(attachment.inquiry_id, current);
  }

  const inquiriesWithAttachments = companyInquiries.map((inquiry) => ({
    ...inquiry,
    attachments: attachmentsByInquiryId.get(inquiry.id) ?? [],
  }));

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
              Panel firmy
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Zapytania ofertowe
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              Tutaj zobaczysz zapytania wysłane do Twojej firmy.
            </p>
            <Link href="/panel" className="mt-5 inline-flex text-sm font-bold text-[#1a5f3c]">
              Wróć do panelu
            </Link>
          </div>

          {inquiriesWithAttachments.length > 0 ? (
            <div className="space-y-5">
              {inquiriesWithAttachments.map((inquiry) => (
                <article
                  key={inquiry.id}
                  className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          {getStatusLabel(inquiry.status)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {formatDate(inquiry.created_at)}
                        </span>
                      </div>
                      <h2 className="break-words text-xl font-extrabold text-slate-900">
                        {inquiry.offers?.title ?? "Zapytanie ofertowe"}
                      </h2>
                      {inquiry.offers?.slug && inquiry.offers.status === "active" ? (
                        <Link
                          href={`/oferty/${inquiry.offers.slug}`}
                          className="mt-2 inline-flex text-sm font-bold text-[#1a5f3c]"
                        >
                          Zobacz ofertę
                        </Link>
                      ) : null}
                    </div>
                    <InquiryActionsClient
                      inquiryId={inquiry.id}
                      status={inquiry.status}
                      attachments={inquiry.attachments}
                    />
                  </div>

                  <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2">
                    {[
                      ["Imię i nazwisko", inquiry.buyer_name],
                      ["Firma kupującego", inquiry.buyer_company],
                      ["Email", inquiry.buyer_email],
                      ["Telefon", inquiry.buyer_phone],
                      ["Ilość / zakres", inquiry.quantity_scope],
                      ["Termin realizacji", inquiry.expected_deadline],
                      ["Budżet", inquiry.budget],
                      ["Branża / usługa", `${inquiry.branch ?? "-"} / ${inquiry.service_type ?? "-"}`],
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
                      Wiadomość
                    </p>
                    <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-700">
                      {inquiry.message}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Brak zapytań ofertowych dla Twojej firmy.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
