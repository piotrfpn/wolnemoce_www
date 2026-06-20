# Powiadomienia e-mail RFQ

Powiadomienia o nowych zapytaniach ofertowych RFQ korzystają z Resend REST API, bez SDK i bez dodatkowych zależności npm.

Runtime jest wpięty do `submitInquiry()` jako best-effort i pozostaje domyślnie w safe mode. Błąd resolvera, konfiguracji albo Resend nie blokuje zapisu RFQ.

## Wymagane zmienne środowiskowe

Dodaj lokalnie do `.env.local`:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=WolneMoce <powiadomienia@wolnemoce.com>
APP_BASE_URL=https://www.wolnemoce.com
SUPABASE_SERVICE_ROLE_KEY=
RFQ_EMAIL_NOTIFICATIONS_ENABLED=false
RFQ_EMAIL_LOG_ONLY=true
RFQ_EMAIL_TEST_RECIPIENT=
RFQ_EMAIL_ALLOWED_RECIPIENT_DOMAIN=
```

Te same zmienne dodaj na Vercel:

`Project Settings -> Environment Variables`

Nie commituj prawdziwego `RESEND_API_KEY` ani `SUPABASE_SERVICE_ROLE_KEY`.

Wysyłka z adresu w domenie `@wolnemoce.com` wymaga wcześniejszej weryfikacji domeny w Resend oraz poprawnej konfiguracji SPF, DKIM i DMARC.

## Źródło adresu odbiorcy

Prywatny e-mail odbiorcy firmy znajduje się w:

`public.company_contact_settings.contact_email`

Pole jest ustawiane przez właściciela firmy w `/panel/profil` jako „E-mail do zapytań ofertowych”.

Adres nie znajduje się już w `public.companies.contact_email`. Ta kolumna została przeniesiona do `company_contact_settings` i usunięta z `companies`.

## Zasady bezpieczeństwa resolvera odbiorcy

- `company_contact_settings.contact_email` nie może być publicznie odczytywany przez klienta.
- Resolver odbiorcy działa w `lib/email/resolveRfqRecipientEmail.ts` wyłącznie server-side.
- Resolver używa `inquiry_id`, a nie danych przekazanych z browsera jako źródła odbiorcy.
- Server-only admin client znajduje się w `lib/supabase/admin.ts` i używa `SUPABASE_SERVICE_ROLE_KEY` tylko po stronie serwera.
- Prywatny e-mail odbiorcy nie może wracać do browsera ani client-visible response.
- Resolver działa po realnym utworzeniu RFQ, na podstawie `inquiry_id`.
- Brak adresu odbiorcy nie blokuje zapisu RFQ.
- Błąd konfiguracji lub API Resend nie cofa zapytania i nie usuwa inquiry.

## Safe mode

W MVP wysyłka powinna być domyślnie wyłączona:

- `RFQ_EMAIL_NOTIFICATIONS_ENABLED=false` - globalny przełącznik wysyłki.
- `RFQ_EMAIL_LOG_ONLY=true` - generowanie/logowanie stanu bez wysyłki.
- `RFQ_EMAIL_TEST_RECIPIENT=` - w dev/staging wszystkie maile mogą trafiać tylko na adres testowy.
- `RFQ_EMAIL_ALLOWED_RECIPIENT_DOMAIN=` - opcjonalne ograniczenie wysyłki do domeny testowej.

## Zasady treści wiadomości

- Załączniki RFQ nie są wysyłane mailem.
- Signed URLs nie są wysyłane mailem.
- Prywatne pliki RFQ są dostępne po zalogowaniu w `/panel/zapytania`.
- Mail do firmy powinien aktywizować odbiorcę i kierować do panelu, a nie zastępować panel.
- W MVP nie należy wysyłać pełnej treści wiadomości, prywatnego telefonu ani prywatnego e-maila kupującego w mailu do firmy.

## Planowany kierunek wdrożenia

Po zapisaniu RFQ system może spróbować wysłać:

- e-mail do firmy na `company_contact_settings.contact_email`,
- opcjonalnie e-mail potwierdzający do nadawcy RFQ na `buyer_email`.

Jeżeli `company_contact_settings.contact_email` jest puste albo niepoprawne, e-mail do firmy jest pomijany, a RFQ nadal zapisuje się normalnie.

## Capacity Request Notifications

### EVENT 1: `capacity_request_interest_created`

Sprint 13D.1 obsługuje to zdarzenie wyłącznie w trybie `LOG_ONLY`. Po skutecznym utworzeniu rekordu w `capacity_request_interests` funkcja `submitCapacityRequestInterest()` uruchamia server-only resolver właściciela i zapisuje zamiar przyszłego powiadomienia przez `console.info`.

Ten flow nie buduje wiadomości, nie odczytuje adresu e-mail, nie importuje transportu e-mail i nie może wykonać requestu do Resend niezależnie od konfiguracji środowiska. RFQ nadal korzysta ze swojego oddzielnego mechanizmu.

Resolver w `lib/email/resolveCapacityRequestEmailContext.ts` używa admin clienta wyłącznie po stronie serwera. Na podstawie `capacity_request_id` odczytuje `capacity_requests.company_id`, a następnie `companies.user_id`. Identyfikator właściciela nie wraca do UI ani response payload. Gdy resolver nie może bezpiecznie ustalić właściciela, log zawiera `recipient_user_id: null`.

Log zawiera wyłącznie:

```ts
{
  mode: "LOG_ONLY",
  event_type: "capacity_request_interest_created",
  capacity_request_id: string,
  recipient_user_id: string | null,
  recipient_locale: "pl" | "en" | "de" | "uk" | "es" | "fr",
  created_at: string
}
```

Obecny model danych nie przechowuje preferencji językowej właściciela zapytania, dlatego `recipient_locale` ma jawny fallback `"pl"`. W przyszłości wartość powinna pochodzić z trwałej preferencji locale w profilu odbiorcy, a nie z locale firmy zgłaszającej zainteresowanie.

Resolver i logger są objęte osobnymi blokami `try/catch`. Błąd resolvera daje `recipient_user_id: null`, a błąd loggera zapisuje wyłącznie ostrzeżenie serwerowe; żaden z nich nie zmienia sukcesu operacji biznesowej. Przy duplikacie (`23505`) funkcja kończy się przed wywołaniem LOG_ONLY, więc nowy intent nie jest logowany.
