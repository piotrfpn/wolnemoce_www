export default function Footer() {
  return (
    <footer className="bg-slate-800 px-6 py-16 text-white">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1.5fr]">
          <div>
            <a href="/" className="mb-5 flex items-center gap-3 no-underline">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a5f3c] to-[#2d8a5e] text-xl text-white shadow-md">
                <i className="fas fa-industry"></i>
              </div>
              <div className="text-[22px] font-extrabold tracking-[-0.5px] text-white">
                Wolne<span className="text-[#2d8a5e]">Moce</span>.pl
              </div>
            </a>

            <p className="mb-6 max-w-sm text-sm leading-7 text-white/60">
              #1 Portal wolnych mocy produkcyjnych w Polsce. Łączymy firmy
              poszukujące możliwości produkcyjnych z zakładami dysponującymi
              wolnymi zdolnościami.
            </p>

            <div className="flex gap-3">
              {[
                ["LinkedIn", "fab fa-linkedin-in"],
                ["Facebook", "fab fa-facebook-f"],
                ["X", "fab fa-twitter"],
                ["YouTube", "fab fa-youtube"],
              ].map(([label, icon]) => (
                <a
                  key={label}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm text-white no-underline transition hover:-translate-y-0.5 hover:bg-[#1a5f3c]"
                  aria-label={label}
                >
                  <i className={icon}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-base font-bold text-white">Portal</h4>
            <ul className="space-y-3 list-none">
              <li>
                <a href="/oferty" className="text-sm text-white/60 no-underline transition hover:text-white">
                  Oferty produkcyjne
                </a>
              </li>
              <li>
                <a href="/dodaj-oferte" className="text-sm text-white/60 no-underline transition hover:text-white">
                  Dodaj ofertę
                </a>
              </li>
              <li>
                <a href="/jak-to-dziala" className="text-sm text-white/60 no-underline transition hover:text-white">
                  Jak to działa
                </a>
              </li>
              <li>
                <a href="/cennik" className="text-sm text-white/60 no-underline transition hover:text-white">
                  Cennik
                </a>
              </li>
              <li>
                <a href="/blog" className="text-sm text-white/60 no-underline transition hover:text-white">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-base font-bold text-white">Branże</h4>
            <ul className="space-y-3 list-none">
              {["Metalurgia", "Tworzywa sztuczne", "Automatyka", "Logistyka", "Magazynowanie"].map(
                (category) => (
                  <li key={category}>
                    <a href="/#kategorie" className="text-sm text-white/60 no-underline transition hover:text-white">
                      {category}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-base font-bold text-white">Firma</h4>
            <ul className="space-y-3 list-none">
              <li>
                <a href="/#ekspert" className="text-sm text-white/60 no-underline transition hover:text-white">
                  Ekspert
                </a>
              </li>
              <li>
                <a href="/kontakt" className="text-sm text-white/60 no-underline transition hover:text-white">
                  Kontakt
                </a>
              </li>
              <li>
                <a href="/regulamin" className="text-sm text-white/60 no-underline transition hover:text-white">
                  Regulamin
                </a>
              </li>
              <li>
                <a href="/polityka-prywatnosci" className="text-sm text-white/60 no-underline transition hover:text-white">
                  Polityka prywatności
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-bold text-white">Newsletter</h4>
            <p className="mb-5 text-sm leading-6 text-white/60">
              Otrzymuj najnowsze oferty i artykuły eksperckie prosto na email.
            </p>

            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Twój email"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#2d8a5e]"
              />
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a5f3c] text-white transition hover:bg-[#2d8a5e]"
                aria-label="Zapisz do newslettera"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© 2026 WolneMoce.pl. Wszelkie prawa zastrzeżone.</p>

          <div className="flex flex-wrap gap-5">
            <a href="/regulamin" className="text-white/40 no-underline transition hover:text-white">
              Regulamin
            </a>
            <a href="/polityka-prywatnosci" className="text-white/40 no-underline transition hover:text-white">
              Polityka prywatności
            </a>
            <a href="/polityka-prywatnosci" className="text-white/40 no-underline transition hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
