import Link from "next/link";
import type { Offer } from "@/lib/mockData";

function Stars() {
  return (
    <span className="text-[11px] text-[#f59e0b]">
      <i className="fas fa-star"></i>
      <i className="fas fa-star"></i>
      <i className="fas fa-star"></i>
      <i className="fas fa-star"></i>
      <i className="fas fa-star-half-alt"></i>
    </span>
  );
}

export default function OfferCard({ offer }: { offer: Offer }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl">
      {offer.isPremium && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
          <i className="fas fa-crown mr-1.5"></i>
          Premium
        </div>
      )}

      {offer.isVerified && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 shadow-sm backdrop-blur">
          <i className="fas fa-check-circle"></i>
          Zweryfikowana
        </div>
      )}

      <div className="relative h-[210px] overflow-hidden bg-slate-100">
        <img
          src={offer.image}
          alt={offer.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-white">
          <span className="flex items-center gap-2 text-xs font-medium">
            <i className="fas fa-map-marker-alt"></i>
            {offer.location}, {offer.province}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
            style={{ background: offer.companyGradient }}
          >
            {offer.companyInitials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{offer.company}</h3>
            <p className="text-[11px] text-slate-400">{offer.companyMeta}</p>
          </div>
        </div>

        <h2 className="mb-2 text-[17px] font-bold leading-snug text-slate-900">
          {offer.title}
        </h2>

        <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">
          {offer.description}
        </p>

        <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-100 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            <i className="fas fa-industry text-[#1a5f3c]"></i>
            {offer.category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            <i className="fas fa-cogs text-[#1a5f3c]"></i>
            {offer.service}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            <i className="fas fa-chart-bar text-[#1a5f3c]"></i>
            {offer.capacity}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            <i className="fas fa-clock text-[#1a5f3c]"></i>
            {offer.leadTime}
          </span>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {offer.certifications.map((certification) => (
            <span
              key={certification}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
            >
              <i className="fas fa-shield-alt"></i>
              {certification}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stars />
            <span className="text-sm font-bold text-slate-900">
              {offer.rating}
            </span>
            <span className="text-xs text-slate-400">({offer.reviews})</span>
          </div>

          <Link
            href={`/oferty/${offer.slug}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1a5f3c] transition hover:text-[#0d3d26]"
          >
            Szczegóły
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </div>
    </article>
  );
}
