"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale, getLocalizedPath } from "@/lib/i18n/config";

type PanelNavLinksProps = {
  locale: Locale;
  unreadCount: number;
  activeCapacityRequestInterestsCount: number;
  labels: {
    panel: string;
    profile: string;
    offers: string;
    projects: string;
    inquiries: string;
    sentInquiries: string;
    myRequests: string;
    settings: string;
  };
};

export default function PanelNavLinks({
  locale,
  unreadCount,
  activeCapacityRequestInterestsCount,
  labels,
}: PanelNavLinksProps) {
  const pathname = usePathname();

  const links = [
    { href: "/panel", label: labels.panel, exact: true, icon: "fas fa-gauge-high" },
    { href: "/panel/profil", label: labels.profile, exact: false, icon: "fas fa-building" },
    { href: "/panel/oferty", label: labels.offers, exact: false, icon: "fas fa-list-check" },
    { href: "/panel/realizacje", label: labels.projects, exact: false, icon: "fas fa-briefcase" },
    { href: "/panel/zapytania", label: labels.inquiries, exact: false, icon: "fas fa-inbox", showBadge: true },
    { href: "/panel/wyslane-zapytania", label: labels.sentInquiries, exact: false, icon: "fas fa-paper-plane" },
    {
      href: "/panel/moje-zapytania",
      label: labels.myRequests,
      exact: false,
      icon: "fas fa-clipboard-list",
      showInterestBadge: true,
    },
    { href: "/panel/ustawienia", label: labels.settings, exact: false, icon: "fas fa-gear" },
  ];

  return (
    <div className="fixed left-0 right-0 top-[72px] z-[990] border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] overflow-x-auto px-6">
        <ul className="flex list-none items-center gap-1 sm:gap-2 whitespace-nowrap py-2">
          {links.map((link) => {
            const localizedHref = getLocalizedPath(link.href, locale);
            const isActive = link.exact
              ? pathname === localizedHref
              : pathname.startsWith(localizedHref);

            return (
              <li key={link.href}>
                <Link
                  href={localizedHref}
                  className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#1a5f3c]/10 text-[#1a5f3c]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#1a5f3c]"
                  }`}
                >
                  <i
                    className={`${link.icon} text-base transition-colors ${
                      isActive ? "text-[#1a5f3c]" : "text-slate-400 group-hover:text-[#1a5f3c]"
                    }`}
                  ></i>
                  <span>{link.label}</span>
                  {link.showBadge && unreadCount > 0 && (
                    <span className="ml-1 inline-flex h-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                  {link.showInterestBadge && activeCapacityRequestInterestsCount > 0 && (
                    <span className="ml-1 inline-flex h-5 items-center justify-center rounded-full bg-[#1a5f3c] px-1.5 text-[10px] font-bold text-white">
                      {activeCapacityRequestInterestsCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
