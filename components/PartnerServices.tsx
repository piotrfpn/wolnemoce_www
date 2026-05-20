import Link from "next/link";

const partners = [
  {
    name: "Credos",
    subtitle: "Księgowość i prawo",
    description:
      "Wsparcie księgowe, prawne i formalne dla firm współpracujących w modelu B2B. Usługi realizowane jako płatne wsparcie partnerskie.",
    image: "/images/partners/credos.jpg",
    cta: "Zapytaj o wsparcie",
    href: "/kontakt?temat=credos",
    website: "https://credos.com",
  },
  {
    name: "LogiMarket",
    subtitle: "Doradztwo procesowe i łańcuch dostaw",
    description:
      "Wsparcie w analizie procesów, outsourcingu produkcji, make-or-buy, RFQ oraz optymalizacji łańcucha dostaw. Usługi realizowane jako płatne wsparcie partnerskie.",
    image: "/images/partners/logimarket.jpg",
    cta: "Zapytaj o doradztwo",
    href: "/kontakt?temat=logimarket",
    website: "https://logimarket.pl",
  },
];

export default function PartnerServices() {
  return (
    <section className="section bg-slate-50" id="partnerzy-uslugowi">
      <div className="section-header fade-in visible">
        <div className="section-label">Partnerzy</div>
        <h2 className="section-title">Partnerzy usługowi WolneMoce.pl</h2>
        <p className="section-desc">
          WolneMoce.pl to nie tylko katalog ofert. Wspólnie z partnerami
          wspieramy firmy także w obszarach prawnych, księgowych, procesowych i
          łańcucha dostaw.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1100px] min-w-0 gap-6 px-0 md:grid-cols-2">
        {partners.map((partner) => (
          <article
            key={partner.name}
            className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:p-8"
          >
            <div className="mb-6 flex min-w-0 items-center gap-4">
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-[#1a5f3c]/40"
                aria-label={`Strona partnera ${partner.name}`}
              >
                <img
                  src={partner.image}
                  alt={`Logo ${partner.name}`}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full object-contain"
                />
              </a>
              <div className="min-w-0">
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-extrabold text-slate-900 no-underline transition hover:text-[#1a5f3c]"
                >
                  {partner.name}
                </a>
                <p className="mt-1 text-sm font-bold text-[#1a5f3c]">
                  {partner.subtitle}
                </p>
              </div>
            </div>

            <p className="min-h-[96px] text-sm leading-7 text-slate-600">
              {partner.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                Usługa płatna / wycena indywidualna
              </span>
              <Link
                href={partner.href}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] no-underline transition hover:text-[#0d3d26]"
              >
                {partner.cta}
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 no-underline transition hover:text-[#1a5f3c]"
              >
                Strona partnera
                <i className="fas fa-up-right-from-square text-xs"></i>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
