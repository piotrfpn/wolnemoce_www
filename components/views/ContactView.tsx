import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { contactInfo } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/server";
import ContactFormClient from "@/app/kontakt/ContactFormClient";

type ContactPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
  locale?: Locale;
};

function getSingleParam(
  searchParams: ContactPageProps["searchParams"],
  key: string
) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ContactView({
  searchParams,
  locale = defaultLocale,
}: ContactPageProps) {
  const t = getDictionary(locale).contactPage;
  const topicParam = getSingleParam(searchParams, "temat").toLowerCase().trim();
  const partnerTopic =
    topicParam === "credos" ||
    topicParam === "logimarket" ||
    topicParam === "administracja" ||
    topicParam === "wyroznienie-oferty"
      ? t.partnerTopics[topicParam as keyof typeof t.partnerTopics]
      : null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let initialName = "";
  let initialCompanyName = "";
  let initialEmail = user?.email ?? "";

  if (user) {
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

    initialName = profile?.full_name ?? "";
    initialCompanyName = company?.name ?? "";
  }

  return (
    <>
      <Navbar locale={locale} />
      <main>
        <PageHero
          label={t.heroLabel}
          title={t.heroTitle}
          description={t.heroDescription}
          icon="fas fa-envelope"
        />

        <section className="section grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            {[
              ["fas fa-envelope", t.labels.email, contactInfo.email],
              ["fas fa-phone", t.labels.phone, contactInfo.phone],
              ["fas fa-clock", t.labels.hours, contactInfo.hours],
            ].map(([icon, label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <i className={`${icon} mb-4 text-2xl text-[#1a5f3c]`}></i>
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  {label}
                </h2>
                {icon === "fas fa-phone" ? (
                  <a href={`tel:${value.replace(/\s+/g, "")}`} className="mt-1 block text-lg font-extrabold text-slate-900 hover:text-emerald-700 transition-colors">
                    {value}
                  </a>
                ) : icon === "fas fa-envelope" ? (
                  <a href={`mailto:${value}`} className="mt-1 block text-lg font-extrabold text-slate-900 hover:text-emerald-700 transition-colors">
                    {value}
                  </a>
                ) : (
                  <p className="mt-1 text-lg font-extrabold text-slate-900">{value}</p>
                )}
              </div>
            ))}
          </div>

          <div>
            {partnerTopic ? (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1a5f3c]">
                    <i className={partnerTopic.icon}></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                      {partnerTopic.label}
                    </p>
                    <h3 className="font-extrabold text-slate-900">
                      {partnerTopic.subject}
                    </h3>
                  </div>
                </div>
                <p>{partnerTopic.description}</p>
              </div>
            ) : null}

            <ContactFormClient
              initialTopic={partnerTopic?.subject ?? ""}
              initialName={initialName}
              initialCompanyName={initialCompanyName}
              initialEmail={initialEmail}
              source={partnerTopic?.source ?? (topicParam ? `contact:${topicParam}` : "contact")}
              locale={locale}
            />
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto grid max-w-[1400px] gap-6 md:grid-cols-2">
            <div className="rounded-[24px] bg-white p-7 shadow-sm">
              <h2 className="mb-3 text-xl font-extrabold text-slate-900">
                {t.buyerBoxTitle}
              </h2>
              <p className="text-sm leading-7 text-slate-500">
                {t.buyerBoxDescription}
              </p>
            </div>
            <div className="rounded-[24px] bg-white p-7 shadow-sm">
              <h2 className="mb-3 text-xl font-extrabold text-slate-900">
                {t.supplierBoxTitle}
              </h2>
              <p className="text-sm leading-7 text-slate-500">
                {t.supplierBoxDescription}
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header fade-in visible">
            <div className="section-label">{t.faqLabel}</div>
            <h2 className="section-title">{t.faqTitle}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {t.faqs.map((faq) => (
              <div key={faq.question} className="rounded-[20px] border border-slate-200 bg-white p-6">
                <h3 className="mb-2 font-extrabold text-slate-900">{faq.question}</h3>
                <p className="text-sm leading-7 text-slate-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
