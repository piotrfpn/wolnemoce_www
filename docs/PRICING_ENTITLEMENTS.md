# Matryca Uprawnień i Planów (Pricing Entitlements)

Niniejszy dokument opisuje techniczne i biznesowe założenia dla planów abonamentowych w WolneMoce.pl przed pełnym wdrożeniem płatności (Stripe) i komercjalizacją.

## Kluczowa zasada architektoniczna

**Baza danych jest źródłem prawdy dla limitów planów.** Helpery we frontendzie (np. `lib/planEntitlements.ts`) służą wyłącznie do sterowania interfejsem użytkownika (UI) i wyświetlania odpowiedniego copy. Każdy limit, aby był faktycznie bezpieczny, musi być egzekwowany na poziomie bazy danych (triggery, RLS).

Wymóg przed uruchomieniem płatności: Zaprojektowanie mechanizmu (tabeli `plan_config` lub triggerów czytających `companies.plan`), który będzie dynamicznie limitował akcje w zależności od planu firmy.

---

## Matryca Planów

### Plan FREE
Plan darmowy służący do walidacji platformy i weryfikacji popytu. Nie zawiera priorytetów.
- **Max ofert (active + pending):** 1
- **Dostęp do zapytań (RFQ):** Tak, tylko ze swojej oferty
- **Profil firmy:** Podstawowy
- **GUS / Dane rejestrowe:** Tak
- **Weryfikacja firmy:** Brak automatycznej weryfikacji
- **Wyróżnienia / Podbicia:** Brak
- **Priorytet moderacji:** Standardowy
- **Statystyki:** Brak / Zablokowane
- **Support:** Standardowy

### Plan PRO
Plan płatny dla aktywnych firm produkcyjnych stawiających na jakość zapytań, a nie spamowanie wieloma ofertami. Wymaga kontaktu w obecnym MVP.
- **Max ofert (active + pending):** 3 - 5 (zamiast np. 10 - platforma B2B ceni jakość i skupienie, 3-5 ofert to rozsądne MVP dla profilu zakładu produkcyjnego).
- **Wyróżnienia / Podbicia:** Możliwość wyróżnienia (Sponsorowane), cykliczne podbicia (w przyszłości)
- **Priorytet moderacji:** Priorytetowy
- **Weryfikacja firmy:** Brak automatycznej weryfikacji. Możliwość priorytetowego zgłoszenia do weryfikacji ręcznej przez administratora.
- **RFQ / Statystyki:** Tak, rozszerzone widoki statystyk
- **Support:** Priorytetowy
- **Profil firmy:** Rozszerzony, lepsza widoczność w katalogu

### Plan ENTERPRISE
Dla grup kapitałowych, większych zakładów, operatorów i partnerów.
- **Max ofert:** Indywidualne limity ustalane administracyjnie lub umownie
- **Usługi Custom:** Import ofert, dedykowany KAM
- **Multi-user / Multi-location:** Wiele kont i oddziałów firmy
- **Partnerzy:** Możliwość pakietowania z usługami add-onów

---

## Techniczna Mapa Egzekwowania

### FREE max 1 active/pending offer
- **Status:** implemented
- **Enforcement:** DB trigger (`tr_enforce_free_plan_offer_limits`)
- **Plik:** `supabase/migrations/00018_free_plan_limits.sql`
- **UI:** `/panel`, `/panel/oferty`, helper TS

### PRO max 3–5 active/pending offers
- **Status:** planned
- **Requires:** DB trigger update / `plan_config` tabela / testy
- **Sprint:** 8C (Nie wystarczy sam TS helper; SQL trigger musi dopuścić 3-5 ofert przy `companies.plan = 'pro'`)

### PRO bumps / refreshes (podbicia)
- **Status:** planned
- **Requires:** Nowe pola w `offers` (np. `last_bumped_at`) lub tabela zdarzeń
- **Sprint:** po 8C lub osobny sprint

### Downgrade PRO → FREE
- **Status:** planned (critical before full Stripe)
- **Opis:** Jeśli wygasa subskrypcja, system musi obsłużyć nadmiarowe oferty. Docelowo: pozostawienie 1 oferty (np. najnowszej), reszta automatycznie przenoszona w stan `archived` lub nowy status `suspended_due_to_plan`. Zero utraty danych (silent data loss). W panelu czytelny alert zachęcający do odnowienia subskrypcji.
- **Requires:** Webhook logic (Stripe), DB update trigger/RPC, UI messages
- **Sprint:** 8C/8D

### Add-ons Partnerskie (Credos / LogiMarket)
- **Status:** planned
- **Koncepcja:** Usługi partnerskie są traktowane horyzontalnie, niezależnie od głównego pionu subskrypcji (FREE -> PRO -> ENTERPRISE). Firma może mieć plan FREE i włączony add-on `credos_lead`.
- **Requires:** Nowa kolumna `companies.active_addons text[]` lub tabela powiązań `company_addons`.
- **Sprint:** Później, przed komercjalizacją pakietów.

---

## Rozdzielenie Trust od Pieniędzy

Krytyczna reguła systemowa: Plan subskrypcyjny (`PRO`, `FREE`) nie jest powiązany ze statusem zaufania platformy (`Firma zweryfikowana`).
- `is_verified` (Firma zweryfikowana) przyznawana jest wyłącznie **ręcznie** przez administratora po sprawdzeniu danych. Plan PRO w żaden sposób nie weryfikuje firmy.
- W interfejsie graficznym zielony znaczek weryfikacji musi funkcjonować obok ewentualnego taga `PRO` / `Sponsorowane`, bez ich wizualnego łączenia. 
- Firma na koncie FREE również może być "Firmą zweryfikowaną".
