"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Oferty", href: "/oferty", match: "/oferty" },
  { label: "Branże", href: "/#kategorie", match: null },
  { label: "Jak to działa", href: "/jak-to-dziala", match: "/jak-to-dziala" },
  { label: "Cennik", href: "/cennik", match: "/cennik" },
  { label: "Ekspert", href: "/#ekspert", match: null },
  { label: "Blog", href: "/blog", match: "/blog" },
  { label: "Kontakt", href: "/kontakt", match: "/kontakt" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-[1000] border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6">
        <a href="/" className="flex items-center gap-3 no-underline" onClick={closeMenu}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] text-xl text-white shadow-md">
            <i className="fas fa-industry"></i>
          </div>
          <div className="text-[22px] font-extrabold tracking-[-0.5px] text-slate-800">
            Wolne<span className="text-[#1a5f3c]">Moce</span>.pl
          </div>
        </a>

        <ul className="hidden list-none items-center gap-2 lg:flex">
          {navLinks.map((link) => {
            const isActive = link.match ? pathname === link.match : false;

            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className={`rounded-lg px-4 py-2 text-sm font-medium no-underline transition ${
                    isActive
                      ? "bg-[#1a5f3c]/10 text-[#1a5f3c]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#1a5f3c]"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/kontakt"
            className="inline-flex items-center justify-center rounded-lg border-2 border-[#1a5f3c] px-5 py-2.5 text-sm font-semibold text-[#1a5f3c] no-underline transition hover:-translate-y-0.5 hover:bg-[#1a5f3c] hover:text-white hover:shadow-md"
          >
            Kontakt
          </a>
          <a
            href="/dodaj-oferte"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-lg shadow-[#1a5f3c]/25 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Dodaj ofertę
          </a>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-800 lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Otwórz menu"
        >
          <i className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 shadow-xl lg:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = link.match ? pathname === link.match : false;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold no-underline ${
                    isActive
                      ? "bg-[#1a5f3c]/10 text-[#1a5f3c]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            <div className="mt-3 grid grid-cols-1 gap-3">
              <a
                href="/kontakt"
                onClick={closeMenu}
                className="inline-flex items-center justify-center rounded-xl border-2 border-[#1a5f3c] px-5 py-3 text-sm font-bold text-[#1a5f3c] no-underline"
              >
                Kontakt
              </a>
              <a
                href="/dodaj-oferte"
                onClick={closeMenu}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] px-5 py-3 text-sm font-bold text-white no-underline shadow-lg shadow-[#1a5f3c]/25"
              >
                Dodaj ofertę
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
